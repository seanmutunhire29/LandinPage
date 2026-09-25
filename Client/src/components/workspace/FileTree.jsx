import { useMemo, useState } from "react"
import { ChevronRight, FileCode2, FileJson, FileText, Folder, FolderOpen } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
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

const iconFor = (path) => {
  if (path.endsWith(".json")) return FileJson
  if (/\.(jsx?|tsx?|css|html)$/.test(path)) return FileCode2
  return FileText
}

function Dir({ node, depth, collapsed, toggle }) {
  const activeFile = useWorkspaceStore((s) => s.activeFile)
  const openFile = useWorkspaceStore((s) => s.openFile)
  const pad = { paddingLeft: 8 + depth * 12 }

  return (
    <>
      {Object.entries(node.dirs)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, child]) => {
          const isCollapsed = collapsed.has(child.path)
          return (
            <div key={child.path}>
              <button onClick={() => toggle(child.path)} className="flex w-full items-center gap-1 py-1 pr-2 text-left text-white/70 hover:bg-white/5" style={pad}>
                <ChevronRight className={cn("size-3.5 shrink-0 transition-transform", !isCollapsed && "rotate-90")} />
                {isCollapsed ? <Folder className="size-3.5 shrink-0 text-[#dcb67a]" /> : <FolderOpen className="size-3.5 shrink-0 text-[#dcb67a]" />}
                <span className="truncate">{name}</span>
              </button>
              {!isCollapsed && <Dir node={child} depth={depth + 1} collapsed={collapsed} toggle={toggle} />}
            </div>
          )
        })}
      {node.files.sort().map((path) => {
        const Icon = iconFor(path)
        return (
          <button
            key={path}
            onClick={() => openFile(path)}
            className={cn("flex w-full items-center gap-1.5 py-1 pr-2 text-left hover:bg-white/5", path === activeFile ? "bg-white/10 text-white" : "text-white/60")}
            style={{ paddingLeft: 8 + depth * 12 + 18 }}
            title={path}
          >
            <Icon className="size-3.5 shrink-0 text-[#519aba]" />
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
    <nav className="h-full overflow-y-auto bg-[#181818] py-2 font-mono text-xs" aria-label="Project files">
      <p className="px-3 pb-2 text-[10px] font-semibold tracking-widest text-white/40 uppercase">Files</p>
      <Dir node={tree} depth={0} collapsed={collapsed} toggle={toggle} />
    </nav>
  )
}
