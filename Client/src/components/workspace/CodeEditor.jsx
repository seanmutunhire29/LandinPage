import Editor from "@monaco-editor/react"
import { X } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { languageFor, MONACO_THEMES } from "./monacoSetup"
import { FileIcon } from "./FileIcon"

/** Open-file tabs over a Monaco editor; the editor theme follows the app's light/dark mode. */
export function CodeEditor({ onEdit }) {
  const openTabs = useWorkspaceStore((s) => s.openTabs)
  const activeFile = useWorkspaceStore((s) => s.activeFile)
  const content = useWorkspaceStore((s) => (s.activeFile ? s.files[s.activeFile] : undefined))
  const openFile = useWorkspaceStore((s) => s.openFile)
  const closeTab = useWorkspaceStore((s) => s.closeTab)
  const { resolvedTheme } = useTheme()

  return (
    <div className="flex h-full min-h-0 flex-col bg-card">
      <div className="flex h-9 shrink-0 overflow-x-auto border-b bg-muted/40" role="tablist">
        {openTabs.map((path) => (
          <div
            key={path}
            role="tab"
            aria-selected={path === activeFile}
            className={cn(
              "group relative flex shrink-0 cursor-pointer items-center gap-2 border-r pr-1.5 pl-3 text-sm transition-colors",
              path === activeFile
                ? "bg-card font-medium text-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
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
              className="grid size-5 place-items-center rounded-md text-muted-foreground opacity-0 outline-none group-hover:opacity-100 group-aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus-visible:opacity-100 focus-visible:ring-3 focus-visible:ring-ring/50"
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
            theme={resolvedTheme === "dark" ? MONACO_THEMES.dark : MONACO_THEMES.light}
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
          <div className="grid h-full place-items-center text-sm text-muted-foreground">Select a file to view its code</div>
        )}
      </div>
    </div>
  )
}
