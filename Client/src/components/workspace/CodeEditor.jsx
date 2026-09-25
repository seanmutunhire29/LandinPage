import Editor from "@monaco-editor/react"
import { X } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { cn } from "@/lib/utils"
import { languageFor } from "./monacoSetup"

export function CodeEditor({ onEdit }) {
  const openTabs = useWorkspaceStore((s) => s.openTabs)
  const activeFile = useWorkspaceStore((s) => s.activeFile)
  const content = useWorkspaceStore((s) => (s.activeFile ? s.files[s.activeFile] : undefined))
  const openFile = useWorkspaceStore((s) => s.openFile)
  const closeTab = useWorkspaceStore((s) => s.closeTab)

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#1e1e1e]">
      <div className="flex h-9 shrink-0 overflow-x-auto border-b border-white/10 bg-[#181818]" role="tablist">
        {openTabs.map((path) => (
          <div
            key={path}
            role="tab"
            aria-selected={path === activeFile}
            className={cn(
              "group flex shrink-0 cursor-pointer items-center gap-2 border-r border-white/10 pr-1.5 pl-3 font-mono text-xs",
              path === activeFile ? "bg-[#1e1e1e] text-white" : "text-white/50 hover:text-white/80"
            )}
            onClick={() => openFile(path)}
            title={path}
          >
            {path.split("/").pop()}
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeTab(path)
              }}
              className="grid size-5 place-items-center rounded opacity-0 group-hover:opacity-100 group-aria-selected:opacity-100 hover:bg-white/10"
              aria-label={`Close ${path}`}
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>
      <div className="min-h-0 flex-1">
        {activeFile && content !== undefined ? (
          <Editor
            path={activeFile}
            language={languageFor(activeFile)}
            value={content}
            theme="vs-dark"
            onChange={(value) => onEdit(activeFile, value ?? "")}
            options={{
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              tabSize: 2,
              wordWrap: "on",
              automaticLayout: true,
              padding: { top: 12 },
            }}
          />
        ) : (
          <div className="grid h-full place-items-center text-sm text-white/40">Select a file to view its code</div>
        )}
      </div>
    </div>
  )
}
