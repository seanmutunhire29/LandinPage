// Drives the WebContainer for the open project: mount files, install deps,
// run the dev server, and execute commands the agent sends over the socket.

import { bootForProject, readFile, toTree, writeFile } from "./container"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"

const store = () => useWorkspaceStore.getState()

// oxlint-disable-next-line no-control-regex
const ANSI = /\x1b\[[0-9;?]*[A-Za-z]|\x1b\][^\x07]*\x07/g
// oxlint-disable-next-line no-control-regex
const CURSOR_COLUMN = /\x1b\[\d*G/g

/** Strip ANSI codes and keep only the final state of \r-rewritten lines (npm spinners). */
export function cleanOutput(text) {
  return text
    .replace(CURSOR_COLUMN, "\r") // cursor-to-column rewrites the line, like \r
    .replace(ANSI, "")
    .split("\n")
    .map((line) => line.split("\r").filter(Boolean).at(-1) ?? "")
    .filter((line) => !/^\s*[\\|/-]\s*$/.test(line)) // leftover npm spinner frames
    .join("\n")
}

let wc = null
let devProcess = null
let serverUrl = null
let serverWaiters = []
let queue = Promise.resolve() // commands run one at a time, after the initial install
const running = new Map() // command id -> process

function enqueue(fn) {
  const next = queue.then(fn, fn)
  queue = next.catch(() => {})
  return next
}

/** Spawn through jsh so pipes/&&/quotes work, stream output to the terminal panel. */
async function spawnLogged(command, { id = crypto.randomUUID(), source = "system", onProcess } = {}) {
  store().terminalStart({ id, command, source })
  const proc = await wc.spawn("jsh", ["-c", command], { terminal: { cols: 120, rows: 30 } })
  onProcess?.(proc)
  let raw = ""
  proc.output.pipeTo(
    new WritableStream({
      write(chunk) {
        raw += chunk
        store().terminalAppend(id, chunk)
      },
    })
  )
  const exitCode = await proc.exit
  const output = cleanOutput(raw).trim()
  store().terminalEnd(id, { status: exitCode === 0 ? "ok" : "error", exitCode, output })
  return { exitCode, output }
}

function waitForServer(timeoutMs = 90_000) {
  if (serverUrl) return Promise.resolve(serverUrl)
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("dev server did not start in time")), timeoutMs)
    serverWaiters.push((url) => {
      clearTimeout(timer)
      resolve(url)
    })
  })
}

function startDevServer() {
  if (devProcess) return waitForServer()
  store().setRuntime({ status: "starting" })
  const id = crypto.randomUUID()
  store().terminalStart({ id, command: "npm run dev", source: "system" })
  wc.spawn("npm", ["run", "dev"]).then((proc) => {
    devProcess = proc
    proc.output.pipeTo(new WritableStream({ write: (chunk) => store().terminalAppend(id, chunk) }))
    proc.exit.then((code) => {
      devProcess = null
      serverUrl = null
      store().terminalEnd(id, { status: code === 0 ? "ok" : "error", exitCode: code })
      if (useWorkspaceStore.getState().runtime.status !== "error") store().setRuntime({ status: "error", error: `Dev server exited (${code})` })
    })
  })
  return waitForServer()
}

let mounted = null // Promise<boolean>: container booted and project files mounted

/**
 * Boot a fresh WebContainer for the project, mount its files, install and start
 * the dev server. The agent may start streaming before this finishes, so boot +
 * install sit at the head of the command queue and file writes wait for the
 * mount. Resolves once the install has finished (the server starts in the
 * background and sets previewUrl via the server-ready event).
 */
export function startProject(projectId, files) {
  wc = null
  devProcess = null
  serverUrl = null
  serverWaiters = []
  store().setRuntime({ status: "booting", error: null })

  mounted = (async () => {
    const container = await bootForProject(projectId)
    container.on("server-ready", (_port, url) => {
      serverUrl = url
      useWorkspaceStore.setState({ previewUrl: url })
      store().setRuntime({ status: "ready", error: null })
      serverWaiters.splice(0).forEach((fn) => fn(url))
    })
    container.on("error", (err) => store().setRuntime({ status: "error", error: err.message }))
    await container.mount(toTree(Object.entries(files).map(([file_path, content]) => ({ file_path, content }))))
    wc = container
    return true
  })().catch((err) => {
    store().setRuntime({ status: "error", error: `Could not start the preview runtime: ${err.message}` })
    return false
  })

  queue = Promise.resolve()
  return enqueue(async () => {
    if (!(await mounted)) return
    if (!("package.json" in files)) return store().setRuntime({ status: "idle" })
    store().setRuntime({ status: "installing" })
    const { exitCode } = await spawnLogged("npm install")
    if (exitCode !== 0) return store().setRuntime({ status: "error", error: "npm install failed, see the terminal" })
    startDevServer().catch((err) => store().setRuntime({ status: "error", error: err.message }))
  })
}

/** Apply a file change (from the agent or the editor) to the container, once it is mounted. */
export async function applyFile(path, content) {
  if (!mounted || !(await mounted)) return
  try {
    await writeFile(wc, path, content)
  } catch (err) {
    console.error("WebContainer write failed", path, err)
  }
}

const DEV_COMMAND = /^(npm (run )?(dev|start)|npx vite( dev| serve)?|vite( dev| serve)?|yarn dev|pnpm dev)\s*$/

/**
 * Run a command the agent requested. Returns { exit_code, output } or { error },
 * which the caller sends back to the agent as the Bash tool result.
 * `onFileChanged(path, content)` is called if the command changed package.json.
 */
export function runAgentCommand(id, command, onFileChanged) {
  return enqueue(async () => {
    if (!wc) return { error: "The preview runtime is not running." }
    if (DEV_COMMAND.test(command.trim())) {
      try {
        const url = await startDevServer()
        return { exit_code: 0, output: `Dev server is running at ${url} (managed automatically, with hot reload).` }
      } catch (err) {
        return { error: err.message }
      }
    }
    const before = await readFile(wc, "package.json")
    try {
      const { exitCode, output } = await spawnLogged(command, { id, source: "agent", onProcess: (p) => running.set(id, p) })
      const after = await readFile(wc, "package.json")
      if (after != null && after !== before) onFileChanged?.("package.json", after)
      return { exit_code: exitCode, output }
    } catch (err) {
      return { error: err.message }
    } finally {
      running.delete(id)
    }
  })
}

export function cancelCommand(id) {
  running.get(id)?.kill()
}

export function reloadPreview() {
  const url = useWorkspaceStore.getState().previewUrl
  if (!url) return
  useWorkspaceStore.setState({ previewUrl: null })
  setTimeout(() => useWorkspaceStore.setState({ previewUrl: url }), 30)
}
