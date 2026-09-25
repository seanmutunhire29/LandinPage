import { useMemo, useState } from "react"
import { ChevronRight, Folder, FolderOpen } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { FileIcon } from "./FileIcon"
import { cn } from "@/lib/utils"

function buildTree(paths) {
  const root = { dirs: {}, files: [] }
  for (const path of paths) {
    const parts = path.split("/")
    let node = root
    parts.slice(0, -1).forEach((part, i) => {
      node.dirs[part] ??= { dirs: {}, files: [], path: parts.slice(0, i + 1).join("/") }
      node = node.dirs[part]
    })
    node.files.push(path)
  }
  return root
}

const INDENT = 12
const row = "group relative flex h-7 w-full items-center gap-1.5 rounded-md pr-2 text-left transition-colors duration-100 outline-none focus-visible:ring-1 focus-visible:ring-brand/60"

function Dir({ node, depth, collapsed, toggle }) {
  const activeFile = useWorkspaceStore((s) => s.activeFile)
  const openFile = useWorkspaceStore((s) => s.openFile)
  const pad = 6 + depth * INDENT

  return (
    <>
      {Object.entries(node.dirs)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, child]) => {
          const isCollapsed = collapsed.has(child.path)
          const holdsActive = isCollapsed && activeFile?.startsWith(child.path + "/")
          return (
            <div key={child.path} role="treeitem" aria-expanded={!isCollapsed}>
              <button onClick={() => toggle(child.path)} className={cn(row, "text-white/70 hover:bg-white/[0.06] hover:text-white")} style={{ paddingLeft: pad }}>
                <ChevronRight className={cn("size-3.5 shrink-0 text-white/35 transition-transform duration-150", !isCollapsed && "rotate-90")} />
                {isCollapsed ? <Folder className="size-3.5 shrink-0 text-[#8e92b0]" /> : <FolderOpen className="size-3.5 shrink-0 text-[#b3b6cf]" />}
                <span className="truncate">{name}</span>
                {holdsActive && <span className="ml-auto size-1.5 shrink-0 rounded-full bg-brand" aria-label="Contains open file" />}
              </button>
              {!isCollapsed && (
                <div role="group" className="relative">
                  <span className="absolute inset-y-0.5 w-px bg-white/[0.07]" style={{ left: pad + 6 }} aria-hidden />
                  <Dir node={child} depth={depth + 1} collapsed={collapsed} toggle={toggle} />
                </div>
              )}
            </div>
          )
        })}
      {node.files.sort().map((path) => {
        const active = path === activeFile
        return (
          <button
            key={path}
            role="treeitem"
            aria-selected={active}
            onClick={() => openFile(path)}
            className={cn(row, active ? "bg-brand/20 text-white" : "text-white/60 hover:bg-white/[0.06] hover:text-white/90")}
            style={{ paddingLeft: pad + 18 }}
            title={path}
          >
            {active && <span className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-brand" aria-hidden />}
            <FileIcon path={path} className={cn("transition-opacity", !active && "opacity-80 group-hover:opacity-100")} />
            <span className="truncate">{path.split("/").pop()}</span>
          </button>
        )
      })}
    </>
  )
}

export function FileTree() {
  const files = useWorkspaceStore((s) => s.files)
  const paths = useMemo(() => Object.keys(files), [files])
  const tree = useMemo(() => buildTree(paths), [paths])
  const [collapsed, setCollapsed] = useState(() => new Set())
  const toggle = (path) =>
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (!next.delete(path)) next.add(path)
      return next
    })

  return (
    <nav className="h-full overflow-y-auto bg-[#181818] px-1.5 py-2 font-mono text-xs" aria-label="Project files">
      <div className="flex items-center justify-between px-1.5 pb-2">
        <p className="font-sans text-[10px] font-semibold tracking-widest text-white/40 uppercase">Files</p>
        {paths.length > 0 && <span className="rounded-full bg-white/[0.06] px-1.5 py-px font-sans text-[10px] font-semibold text-white/40 tabular-nums">{paths.length}</span>}
      </div>
      <div role="tree">
        <Dir node={tree} depth={0} collapsed={collapsed} toggle={toggle} />
      </div>
    </nav>
  )
}
