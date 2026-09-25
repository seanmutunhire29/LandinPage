import "@/components/workspace/monacoSetup"
import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Group, Panel, Separator } from "react-resizable-panels"
import { Code2, Columns2, Eye, LayoutGrid, Loader2 } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { useProjectSession } from "@/components/workspace/useProjectSession"
import { ChatPanel } from "@/components/chat/ChatPanel"
import { FileTree } from "@/components/workspace/FileTree"
import { CodeEditor } from "@/components/workspace/CodeEditor"
import { Preview } from "@/components/workspace/Preview"
import { ViewSwitch } from "@/components/workspace/ViewSwitch"
import { Terminal } from "@/components/workspace/Terminal"
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
  return <Separator className="w-px bg-[#e3e5f0] transition-colors hover:bg-brand data-[separator=active]:bg-brand" />
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
          <Separator className="w-px bg-white/10 hover:bg-brand" />
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
  const [view, setView] = useState("split")

  return (
    <div className="flex h-svh flex-col bg-brand-mist">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b border-[#e3e5f0] bg-white px-3">
        <Link to="/" aria-label="LandInPage home" className="shrink-0 scale-90">
          <Logo />
        </Link>
        <span className="h-5 w-px bg-[#e3e5f0]" />
        <Link to="/projects" className="grid size-8 place-items-center rounded-lg text-[#676879] hover:bg-[#f1f2f8]" aria-label="All projects">
          <LayoutGrid className="size-4" />
        </Link>
        <h1 className="min-w-0 truncate font-display text-sm font-semibold text-brand-navy">{project?.name ?? "Loading..."}</h1>
        {runtime.status !== "idle" && (
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
              runtime.status === "ready" && "bg-[#e6faf1] text-[#00854b]",
              runtime.status === "error" && "bg-[#fff0f2] text-[#b3263e]",
              !["ready", "error"].includes(runtime.status) && "bg-[#eef0fb] text-brand"
            )}
          >
            {!["ready", "error"].includes(runtime.status) && <Loader2 className="size-3 animate-spin" />}
            {runtime.status === "ready" && <span className="size-1.5 rounded-full bg-brand-green" />}
            {RUNTIME_LABEL[runtime.status]}
          </span>
        )}
        <div className="ml-auto flex items-center gap-3">
          <ViewSwitch options={VIEWS} value={view} onChange={setView} label="Layout" />
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
    </div>
  )
}
