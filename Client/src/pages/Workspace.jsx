import "@/components/workspace/monacoSetup"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Code2, Columns2, Download, Eye, LayoutGrid, Loader2 } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { useProjectSession } from "@/components/workspace/useProjectSession"
import { ChatPanel } from "@/components/chat/ChatPanel"
import { FileTree } from "@/components/workspace/FileTree"
import { CodeEditor } from "@/components/workspace/CodeEditor"
import { Preview } from "@/components/workspace/Preview"
import { Terminal } from "@/components/workspace/Terminal"
import { ExportDialog } from "@/components/workspace/ExportDialog"
import { UserMenu } from "@/components/auth/UserMenu"
import { Logo, LogoMark } from "@/components/marketing/Logo"
import { ModeToggle } from "@/components/mode-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Separator } from "@/components/ui/separator"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const VIEWS = [
  { id: "code", label: "Code", Icon: Code2 },
  { id: "split", label: "Split", Icon: Columns2 },
  { id: "preview", label: "Preview", Icon: Eye },
]

const RUNTIME_LABEL = {
  booting: "Booting",
  installing: "Installing",
  starting: "Starting",
  ready: "Live",
  error: "Error",
}

const RUNTIME_VARIANT = { ready: "success", error: "destructive" }

const handle = "transition-colors hover:bg-ring data-[separator=active]:bg-ring"

function CodePane({ onEdit }) {
  return (
    <ResizablePanelGroup orientation="vertical">
      <ResizablePanel minSize={120}>
        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize={200} minSize={140} maxSize={360}>
            <FileTree />
          </ResizablePanel>
          <ResizableHandle className={handle} />
          <ResizablePanel minSize={200}>
            <CodeEditor onEdit={onEdit} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <ResizableHandle className={handle} />
      <ResizablePanel defaultSize={160} minSize={60} collapsible>
        <Terminal />
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}

export default function Workspace() {
  const { projectId } = useParams()
  const { sendChat, retry, editFile } = useProjectSession(projectId)
  const project = useWorkspaceStore((s) => s.project)
  const runtime = useWorkspaceStore((s) => s.runtime)
  const files = useWorkspaceStore((s) => s.files)
  const [view, setView] = useState("split")
  const [exportOpen, setExportOpen] = useState(false)
  const busy = !["ready", "error"].includes(runtime.status)

  return (
    <div className="flex h-svh flex-col bg-background">
      <header className="grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 border-b bg-background px-3 md:gap-4 md:px-4">
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          <Link to="/" aria-label="LandinPage home" className="shrink-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
            <LogoMark className="size-7 sm:hidden" />
            <Logo size="sm" className="hidden sm:inline-block" />
          </Link>
          <Separator orientation="vertical" className="h-6! shrink-0" />
          <Breadcrumb aria-label="Breadcrumb" className="min-w-0">
            <BreadcrumbList className="flex-nowrap">
              <BreadcrumbItem className="shrink-0">
                <BreadcrumbLink asChild>
                  <Link to="/profile" className="inline-flex items-center gap-1.5 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                    <LayoutGrid className="size-3.5" />
                    <span className="hidden lg:inline">Projects</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="min-w-0">
                <h1 className="min-w-0 truncate">
                  <BreadcrumbPage className="font-medium">{project?.name ?? "Loading..."}</BreadcrumbPage>
                </h1>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          {runtime.status !== "idle" && (
            <Badge variant={RUNTIME_VARIANT[runtime.status] ?? "secondary"} className="shrink-0">
              {busy && <Loader2 className="animate-spin" />}
              {runtime.status === "ready" && <span className="size-1.5 animate-pulse rounded-full bg-success" />}
              {runtime.status === "error" && <span className="size-1.5 rounded-full bg-destructive" />}
              <span className="sr-only sm:not-sr-only">{RUNTIME_LABEL[runtime.status]}</span>
            </Badge>
          )}
        </div>
        <ToggleGroup type="single" variant="outline" size="sm" spacing={0} value={view} onValueChange={(v) => v && setView(v)} aria-label="Layout">
          {VIEWS.map(({ id, label, Icon }) => (
            <ToggleGroupItem key={id} value={id} aria-label={label}>
              <Icon />
              <span className="hidden md:inline">{label}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExportOpen(true)}
            disabled={!project || !Object.keys(files).length}
            title="Download files as a zip"
          >
            <Download />
            <span className="hidden md:inline">Download</span>
          </Button>
          <ModeToggle />
          <UserMenu />
        </div>
      </header>

      <ResizablePanelGroup orientation="horizontal" className="min-h-0 flex-1">
        <ResizablePanel defaultSize={380} minSize={300} maxSize={560}>
          <ChatPanel onSend={sendChat} onRetry={retry} />
        </ResizablePanel>
        <ResizableHandle className={handle} />
        {view !== "preview" && (
          <ResizablePanel id="code" minSize={320}>
            <CodePane onEdit={editFile} />
          </ResizablePanel>
        )}
        {view === "split" && <ResizableHandle className={handle} />}
        {view !== "code" && (
          <ResizablePanel id="preview" minSize={320}>
            <Preview />
          </ResizablePanel>
        )}
      </ResizablePanelGroup>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}
