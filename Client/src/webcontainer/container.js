// One WebContainer per page. Opening a different project tears the old one down
// and boots a fresh instance: the container is a disposable runtime, Supabase is
// the source of truth.

import { WebContainer } from "@webcontainer/api"

let instance = null
let booting = null
let bootedFor = null

export async function bootForProject(projectId) {
  if (bootedFor === projectId && (instance || booting)) return instance ?? booting
  if (booting) await booting.catch(() => {})
  if (instance) {
    instance.teardown()
    instance = null
  }
  bootedFor = projectId
  booting = WebContainer.boot({ coep: "credentialless", workdirName: "project" })
  try {
    instance = await booting
    return instance
  } finally {
    booting = null
  }
}

export const getContainer = () => instance

/** [{file_path, content}] -> WebContainer FileSystemTree */
export function toTree(files) {
  const root = {}
  for (const { file_path, content } of files) {
    const parts = file_path.split("/").filter(Boolean)
    let dir = root
    parts.slice(0, -1).forEach((part) => {
      dir[part] ??= { directory: {} }
      dir = dir[part].directory
    })
    dir[parts.at(-1)] = { file: { contents: content } }
  }
  return root
}

export async function writeFile(wc, path, content) {
  const dir = path.split("/").slice(0, -1).join("/")
  if (dir) await wc.fs.mkdir(dir, { recursive: true })
  await wc.fs.writeFile(path, content)
}

export async function readFile(wc, path) {
  try {
    return await wc.fs.readFile(path, "utf-8")
  } catch {
    return null
  }
}
