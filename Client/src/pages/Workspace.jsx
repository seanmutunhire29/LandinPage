import "@/components/workspace/monacoSetup"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Group, Panel, Separator } from "react-resizable-panels"
import { ChevronRight, Code2, Columns2, Download, Eye, LayoutGrid, Loader2 } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { useProjectSession } from "@/components/workspace/useProjectSession"
import { ChatPanel } from "@/components/chat/ChatPanel"
import { FileTree } from "@/components/workspace/FileTree"
import { CodeEditor } from "@/components/workspace/CodeEditor"
import { Preview } from "@/components/workspace/Preview"
import { Segmented } from "@/components/brand/segmented"
import { BrandButton } from "@/components/brand/button"
import { Terminal } from "@/components/workspace/Terminal"
import { ExportDialog } from "@/components/workspace/ExportDialog"
import { UserMenu } from "@/components/auth/UserMenu"
import { Logo } from "@/components/marketing/Logo"
import { cn } from "@/lib/utils"

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

function HSep() {
  return <Separator className="w-px bg-border transition-colors hover:bg-brand data-[separator=active]:bg-brand" />
}

function VSep() {
  return <Separator className="h-px bg-white/10 transition-colors hover:bg-brand data-[separator=active]:bg-brand" />
}

function CodePane({ onEdit }) {
  return (
    <Group orientation="vertical">
      <Panel minSize={120}>
        <Group orientation="horizontal">
          <Panel defaultSize={200} minSize={140} maxSize={360}>
            <FileTree />
          </Panel>
          <Separator className="w-px bg-white/10 transition-colors hover:bg-brand data-[separator=active]:bg-brand" />
          <Panel minSize={200}>
            <CodeEditor onEdit={onEdit} />
          </Panel>
        </Group>
      </Panel>
      <VSep />
      <Panel defaultSize={160} minSize={60} collapsible>
        <Terminal />
      </Panel>
    </Group>
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

  return (
    <div className="flex h-svh flex-col bg-brand-mist">
      <header className="relative z-10 grid h-14 shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 bg-white px-gutter shadow-[0_12px_30px_-20px_rgb(59_7_100/0.4)]">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" aria-label="LandinPage home" className="shrink-0 rounded-lg outline-none focus-visible:ring-4 focus-visible:ring-brand/30">
            <Logo size="sm" />
          </Link>
          <span className="h-6 w-px shrink-0 bg-border" aria-hidden />
          <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
            <Link
              to="/profile"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 font-medium text-brand-muted transition-colors hover:bg-muted hover:text-brand-navy"
            >
              <LayoutGrid className="size-3.5" />
              <span className="hidden lg:inline">Projects</span>
            </Link>
            <ChevronRight className="size-3.5 shrink-0 text-brand-subtle/60" aria-hidden />
            <h1 className="min-w-0 truncate font-display text-ui font-semibold text-brand-navy">{project?.name ?? "Loading..."}</h1>
          </nav>
          {runtime.status !== "idle" && (
            <span
              className={cn(
                "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-xs font-semibold ring-1 ring-inset",
                runtime.status === "ready" && "bg-success-soft text-success ring-brand-green/25",
                runtime.status === "error" && "bg-danger-soft text-danger ring-brand-red/25",
                !["ready", "error"].includes(runtime.status) && "bg-secondary text-brand-dark ring-brand/20"
              )}
            >
              {!["ready", "error"].includes(runtime.status) && <Loader2 className="size-3 animate-spin" />}
              {runtime.status === "ready" && <span className="size-1.5 animate-pulse rounded-full bg-brand-green" />}
              {runtime.status === "error" && <span className="size-1.5 rounded-full bg-brand-red" />}
              {RUNTIME_LABEL[runtime.status]}
            </span>
          )}
        </div>
        <Segmented options={VIEWS} value={view} onChange={setView} label="Layout" />
        <div className="flex items-center justify-end gap-3">
          <BrandButton
            variant="outline"
            size="sm"
            onClick={() => setExportOpen(true)}
            disabled={!project || !Object.keys(files).length}
            title="Download files as a zip"
          >
            <Download />
            <span className="hidden md:inline">Download</span>
          </BrandButton>
          <UserMenu />
        </div>
      </header>

      <Group orientation="horizontal" className="min-h-0 flex-1">
        <Panel defaultSize={380} minSize={300} maxSize={560}>
          <ChatPanel onSend={sendChat} onRetry={retry} />
        </Panel>
        <HSep />
        {view !== "preview" && (
          <Panel id="code" minSize={320}>
            <CodePane onEdit={editFile} />
          </Panel>
        )}
        {view === "split" && <HSep />}
        {view !== "code" && (
          <Panel id="preview" minSize={320}>
            <Preview />
          </Panel>
        )}
      </Group>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}
