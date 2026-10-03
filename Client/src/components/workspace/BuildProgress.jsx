import { Check, Loader2 } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const INSTALL = /\b(npm|pnpm|yarn)\s+(i|install|add)\b/
const basename = (p = "") => p.split("/").pop()

/**
 * Steps derived from real signals: agent tool calls and runtime status. Agent
 * and runtime work overlap, so each step carries its own state rather than
 * the list being strictly sequential.
 */
function useBuildSteps() {
  const tools = useWorkspaceStore((s) => s.tools)
  const turnRunning = useWorkspaceStore((s) => s.turnRunning)
  const rt = useWorkspaceStore((s) => s.runtime.status)

  const calls = Object.values(tools)
  const writes = calls.filter((t) => t.name === "Write" || t.name === "Edit")
  const lastWrite = writes.findLast((t) => t.status === "running") ?? writes.at(-1)
  const install = calls.findLast((t) => t.name === "Bash" && t.status === "running" && INSTALL.test(t.args?.command ?? ""))
  const agent = turnRunning || calls.length > 0

  return [
    {
      id: "boot",
      label: "Starting the in-browser runtime",
      detail: "A private sandbox, right in this tab",
      state: rt === "booting" ? "active" : "done",
    },
    agent && {
      id: "spec",
      label: "Reading your design spec",
      detail: "Palette, type, surfaces and motion",
      state: writes.length || !turnRunning ? "done" : "active",
    },
    agent && {
      id: "write",
      label: "Writing components",
      detail: lastWrite ? `${basename(lastWrite.args?.file_path)} · ${writes.length} ${writes.length === 1 ? "file" : "files"}` : "One section at a time",
      state: writes.length && turnRunning ? "active" : writes.length ? "done" : "upcoming",
    },
    {
      id: "install",
      label: "Installing dependencies",
      detail: install?.args.command ?? "Usually the longest step, often under a minute",
      state: rt === "installing" || install ? "active" : ["starting", "ready"].includes(rt) ? "done" : "upcoming",
    },
    {
      id: "serve",
      label: "Starting the dev server",
      detail: "Hot reload keeps this preview live",
      state: rt === "starting" ? "active" : rt === "ready" ? "done" : "upcoming",
    },
  ].filter(Boolean)
}

/** A landing-page wireframe that fills in as the build advances. */
function Wireframe({ progress }) {
  const on = (at) => progress >= at
  const block = (at, fill, cls) => (
    <div className={cn("rounded-sm transition-colors duration-700 ease-out", on(at) ? fill : "bg-muted", cls)} />
  )
  return (
    <div className="w-60 rounded-xl border bg-card p-3 shadow-sm" aria-hidden>
      <div className="flex items-center gap-1.5">
        {block(0.1, "bg-primary", "size-2.5 rounded-full")}
        {block(0.1, "bg-foreground/70", "h-1.5 w-10")}
        <div className="ml-auto flex gap-1">
          {block(0.2, "bg-muted-foreground/40", "h-1.5 w-5")}
          {block(0.2, "bg-muted-foreground/40", "h-1.5 w-5")}
        </div>
      </div>
      <div className="mt-4 flex flex-col items-center gap-1.5">
        {block(0.3, "bg-foreground", "h-2.5 w-36")}
        {block(0.35, "bg-foreground", "h-2.5 w-24")}
        {block(0.45, "bg-muted-foreground/40", "mt-1 h-1.5 w-32")}
        {block(0.55, "bg-primary", "mt-2 h-4 w-16 rounded-md")}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-1.5">
        {block(0.65, "bg-accent border", "h-10")}
        {block(0.75, "bg-accent border", "h-10")}
        {block(0.85, "bg-accent border", "h-10")}
      </div>
    </div>
  )
}

/** Build checklist and wireframe shown in the preview pane until the dev server is up. */
export function BuildProgress() {
  const steps = useBuildSteps()
  const current = steps.findLast((s) => s.state === "active")
  const done = steps.filter((s) => s.state === "done").length
  const progress = (done + (current ? 0.5 : 0)) / steps.length
  const finished = done === steps.length

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-6">
      <Wireframe progress={progress} />
      <div className="w-full text-center" aria-live="polite">
        <p className="text-base font-semibold text-foreground">{current?.label ?? (finished ? "Opening the preview" : "Waiting for project files")}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{current?.detail ?? (finished ? "Almost there" : "The agent will start writing shortly")}</p>
        <Progress value={Math.max(progress, 0.04) * 100} className="mt-3 [&>[data-slot=progress-indicator]]:duration-700" />
      </div>
      <ol className="flex w-full flex-col gap-2">
        {steps.map((s) => (
          <li key={s.id} className={cn("flex items-center gap-2.5 text-sm transition-colors", s.state === "upcoming" ? "text-muted-foreground" : "text-foreground")}>
            <span
              className={cn(
                "grid size-5 shrink-0 place-items-center rounded-full transition-colors",
                s.state === "done" && "bg-success/10 text-success",
                s.state === "active" && "bg-muted text-foreground",
                s.state === "upcoming" && "border"
              )}
            >
              {s.state === "done" && <Check className="size-3" strokeWidth={3} />}
              {s.state === "active" && <Loader2 className="size-3 animate-spin" strokeWidth={2.5} />}
            </span>
            <span className={cn("shrink-0", s.state === "active" && "font-medium")}>{s.label}</span>
            {s.state === "active" && s !== current && <span className="ml-auto min-w-0 truncate text-xs text-muted-foreground">{s.detail}</span>}
          </li>
        ))}
      </ol>
    </div>
  )
}
