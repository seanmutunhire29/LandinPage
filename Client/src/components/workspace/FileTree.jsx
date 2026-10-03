import { useMemo, useState } from "react"
import { ChevronRight, Folder, FolderOpen } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileIcon } from "./FileIcon"
import { buildTree } from "@/lib/fileTree"
import { cn } from "@/lib/utils"

const INDENT = 12
const row =
  "group relative flex h-7 w-full items-center gap-1.5 rounded-md pr-2 text-left transition-colors duration-100 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"

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
              <button onClick={() => toggle(child.path)} className={cn(row, "text-foreground hover:bg-accent/50")} style={{ paddingLeft: pad }}>
                <ChevronRight className={cn("size-3.5 shrink-0 text-muted-foreground transition-transform duration-150", !isCollapsed && "rotate-90")} />
                {isCollapsed ? <Folder className="size-3.5 shrink-0 text-muted-foreground" /> : <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />}
                <span className="truncate">{name}</span>
                {holdsActive && <span className="ml-auto size-1.5 shrink-0 rounded-full bg-primary" aria-label="Contains open file" />}
              </button>
              {!isCollapsed && (
                <div role="group" className="relative">
                  <span className="absolute inset-y-0.5 w-px bg-border" style={{ left: pad + 6 }} aria-hidden />
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
            className={cn(row, active ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground")}
            style={{ paddingLeft: pad + 18 }}
            title={path}
          >
            <FileIcon path={path} />
            <span className="truncate">{path.split("/").pop()}</span>
          </button>
        )
      })}
    </>
  )
}

/** Collapsible project file tree; clicking a file opens it in the editor. */
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
    <nav className="h-full bg-muted/40 text-sm" aria-label="Project files">
      <ScrollArea className="h-full [&>[data-slot=scroll-area-viewport]>div]:block!">
        <div className="px-1.5 py-2">
          <div className="flex items-center justify-between px-1.5 pb-2">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Files</p>
            {paths.length > 0 && (
              <Badge variant="secondary" className="tabular-nums">
                {paths.length}
              </Badge>
            )}
          </div>
          <div role="tree">
            <Dir node={tree} depth={0} collapsed={collapsed} toggle={toggle} />
          </div>
        </div>
      </ScrollArea>
    </nav>
  )
}
