import Editor from "@monaco-editor/react"
import { X } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { cn } from "@/lib/utils"
import { languageFor, MONACO_THEME } from "./monacoSetup"
import { FileIcon } from "./FileIcon"

// Matches editor.background in the plum Monaco theme (monacoSetup.js).
const MONACO_BG = "bg-[#2a0548]"

export function CodeEditor({ onEdit }) {
  const openTabs = useWorkspaceStore((s) => s.openTabs)
  const activeFile = useWorkspaceStore((s) => s.activeFile)
  const content = useWorkspaceStore((s) => (s.activeFile ? s.files[s.activeFile] : undefined))
  const openFile = useWorkspaceStore((s) => s.openFile)
  const closeTab = useWorkspaceStore((s) => s.closeTab)

  return (
    <div className={cn("flex h-full min-h-0 flex-col", MONACO_BG)}>
      <div className="flex h-10 shrink-0 gap-1 overflow-x-auto bg-brand-navy px-1.5 pt-1.5" role="tablist">
        {openTabs.map((path) => (
          <div
            key={path}
            role="tab"
            aria-selected={path === activeFile}
            className={cn(
              "group relative flex shrink-0 cursor-pointer items-center gap-2 rounded-t-lg pr-1.5 pl-3 text-sm transition-colors",
              path === activeFile
                ? cn(MONACO_BG, "font-medium text-white after:absolute after:inset-x-3 after:top-0 after:h-0.5 after:rounded-full after:bg-brand")
                : "text-white/55 hover:bg-white/[0.06] hover:text-white/85"
            )}
            onClick={() => openFile(path)}
            title={path}
          >
            <FileIcon path={path} />
            {path.split("/").pop()}
            <button
              onClick={(e) => {
                e.stopPropagation()
                closeTab(path)
              }}
              className="grid size-5 place-items-center rounded-full opacity-0 group-hover:opacity-100 group-aria-selected:opacity-100 hover:bg-white/10"
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
            theme={MONACO_THEME}
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
