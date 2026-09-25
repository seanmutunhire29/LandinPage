import { create } from "zustand"

const initial = {
  project: null,
  files: {}, // path -> content, mirrors project_files
  openTabs: [],
  activeFile: null,
  messages: [], // chat_messages rows
  streaming: "", // text of the assistant message currently streaming
  turnRunning: false,
  tools: {}, // tool_call_id -> { name, args, status: "running" | "ok" | "error", summary }
  connection: "idle", // idle | connecting | open | closed
  runtime: { status: "idle", error: null }, // idle | booting | installing | starting | ready | error
  previewUrl: null,
  terminal: [], // { id, command, source: "agent" | "system", status, exitCode, output }
  error: null,
}

export const useWorkspaceStore = create((set) => ({
  ...initial,

  reset: () => set({ ...initial }),

  load: ({ project, files, messages }) => {
    const map = Object.fromEntries(files.map((f) => [f.file_path, f.content]))
    const first = ["src/App.jsx", "index.html"].find((p) => p in map) ?? Object.keys(map)[0] ?? null
    set({ project, files: map, messages, openTabs: first ? [first] : [], activeFile: first })
  },

  setFile: (path, content) => set((s) => ({ files: { ...s.files, [path]: content } })),

  openFile: (path) =>
    set((s) => ({ activeFile: path, openTabs: s.openTabs.includes(path) ? s.openTabs : [...s.openTabs, path] })),
  closeTab: (path) =>
    set((s) => {
      const openTabs = s.openTabs.filter((p) => p !== path)
      const i = s.openTabs.indexOf(path)
      const activeFile = s.activeFile === path ? (openTabs[i] ?? openTabs[i - 1] ?? null) : s.activeFile
      return { openTabs, activeFile }
    }),

  addMessage: (message) =>
    set((s) => (s.messages.some((m) => m.id === message.id) ? {} : { messages: [...s.messages, message] })),
  appendToken: (text) => set((s) => ({ streaming: s.streaming + text })),

  toolStart: ({ id, name, args }) => set((s) => ({ tools: { ...s.tools, [id]: { name, args, status: "running" } } })),
  toolResult: ({ id, name, ok, summary }) =>
    set((s) => ({ tools: { ...s.tools, [id]: { ...s.tools[id], name, status: ok ? "ok" : "error", summary } } })),

  setRuntime: (runtime) => set((s) => ({ runtime: { ...s.runtime, ...runtime } })),

  terminalStart: (entry) => set((s) => ({ terminal: [...s.terminal.slice(-49), { output: "", status: "running", ...entry }] })),
  terminalAppend: (id, chunk) =>
    set((s) => ({ terminal: s.terminal.map((t) => (t.id === id ? { ...t, output: (t.output + chunk).slice(-20000) } : t)) })),
  terminalEnd: (id, patch) => set((s) => ({ terminal: s.terminal.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
}))
