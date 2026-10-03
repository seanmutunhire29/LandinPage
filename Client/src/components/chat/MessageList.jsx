import { Fragment, useEffect, useRef } from "react"
import { AlertCircle, CheckCircle2, CircleDashed, FilePen, FilePlus2, FileSearch, Globe, Loader2, Plug, Sparkles, SquareTerminal, XCircle } from "lucide-react"
import { LogoMark } from "@/components/marketing/Logo"
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Minimal inline formatting for agent replies: `code` and **bold**. */
function formatText(text) {
  return text.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g).map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
      return <code key={i} className="rounded-md bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground">{part.slice(1, -1)}</code>
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>
    return <Fragment key={i}>{part}</Fragment>
  })
}

function parseArgs(call) {
  try {
    return JSON.parse(call.function?.arguments || "{}")
  } catch {
    return {}
  }
}

/** Per-tool visual language: accent color, icon, a short kind label and the target. */
const TOOL_STYLES = {
  read: { tile: "bg-tool-read/10 text-tool-read", kind: "text-tool-read", sweep: "bg-tool-read", ring: "border-tool-read/50" },
  write: { tile: "bg-tool-write/10 text-tool-write", kind: "text-tool-write", sweep: "bg-tool-write", ring: "border-tool-write/50" },
  bash: { tile: "bg-muted text-tool-bash", kind: "text-tool-bash", sweep: "bg-tool-bash", ring: "border-tool-bash/50" },
  web: { tile: "bg-tool-web/10 text-tool-web", kind: "text-tool-web", sweep: "bg-tool-web", ring: "border-tool-web/50" },
  mcp: { tile: "bg-tool-mcp/10 text-tool-mcp", kind: "text-tool-mcp", sweep: "bg-tool-mcp", ring: "border-tool-mcp/50" },
}

function describeTool(name, args) {
  if (name === "Write") return { tone: "write", Icon: FilePlus2, kind: "Write", path: args.file_path ?? "" }
  if (name === "Edit") return { tone: "write", Icon: FilePen, kind: "Edit", path: args.file_path ?? "" }
  if (name === "Read") return { tone: "read", Icon: FileSearch, kind: "Read", path: args.file_path ?? "" }
  if (name === "Bash") return { tone: "bash", Icon: SquareTerminal, kind: "Terminal", target: args.command ?? "command" }
  if (name === "WebSearch") return { tone: "web", Icon: Globe, kind: "Web search", target: `"${args.query ?? ""}"` }
  if (name?.startsWith("mcp__")) return { tone: "mcp", Icon: Plug, kind: "Integration", target: name.split("__").slice(1).join(" / ") }
  return { tone: "mcp", Icon: Sparkles, kind: "Tool", target: name }
}

const STATUS = {
  pending: { label: "Queued", Icon: CircleDashed, className: "text-muted-foreground" },
  running: { label: "Running", Icon: Loader2, spin: true },
  ok: { label: "Done", Icon: CheckCircle2, className: "text-success" },
  error: { label: "Failed", Icon: XCircle, className: "text-destructive" },
}

/** Muted directory, emphasised file name. */
function FilePath({ path }) {
  if (!path) return "file"
  const i = path.lastIndexOf("/")
  return (
    <>
      {i >= 0 && <span className="text-muted-foreground">{path.slice(0, i + 1)}</span>}
      <span className="font-medium">{path.slice(i + 1)}</span>
    </>
  )
}

function ToolCard({ call, live, status }) {
  const { tone, Icon, kind, path, target } = describeTool(call.function?.name, live?.args ?? parseArgs(call))
  const s = TOOL_STYLES[tone]
  const st = STATUS[status]
  const bash = tone === "bash"

  return (
    <li
      data-status={status}
      title={live?.summary}
      className={cn(
        "relative flex items-center gap-2.5 overflow-hidden rounded-lg border bg-card p-1.5 pr-2.5 text-xs text-card-foreground transition-[opacity,border-color]",
        status === "pending" && "opacity-60",
        status === "running" && cn("shadow-xs", s.ring),
        status === "error" && "border-destructive/50"
      )}
    >
      <span className={cn("grid size-7 shrink-0 place-items-center rounded-md", s.tile)}>
        <Icon className="size-3.5" />
      </span>
      <div className="min-w-0 flex-1 leading-tight">
        <p className={cn("text-xs font-medium tracking-wide uppercase", s.kind)}>{kind}</p>
        <p className={cn("truncate", bash && "font-mono text-xs")}>
          {bash && <span className="mr-1 text-success">$</span>}
          {path !== undefined ? <FilePath path={path} /> : target}
        </p>
      </div>
      <span className={cn("inline-flex shrink-0 items-center gap-1 text-xs font-medium", bash && status !== "error" ? "text-muted-foreground" : (st.className ?? s.kind))}>
        <st.Icon className={cn("size-3.5", st.spin && "animate-spin")} />
        <span>{st.label}</span>
      </span>
      {status === "running" && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden" aria-hidden>
          <span className={cn("block h-full w-2/5 animate-[dp-sweep_1.2s_ease-in-out_infinite] rounded-full", s.sweep)} />
        </span>
      )}
    </li>
  )
}

export function MessageList({ messages, streaming = "", working = false, tools = {}, error, onRetry, className }) {
  const end = useRef(null)
  const visible = messages.filter((m) => m.role === "user" || (m.role === "assistant" && (m.content || m.tool_calls?.length)))
  // Calls with a stored result finished in an earlier session; unresolved ones in a running turn are queued.
  const resolved = new Set(messages.filter((m) => m.role === "tool").map((m) => m.tool_call_id))
  const statusOf = (call) => tools[call.id]?.status ?? (resolved.has(call.id) || !working ? "ok" : "pending")

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }, [visible.length, streaming, working, tools])

  // Consecutive assistant messages (text, tool calls, the live stream) form one agent turn.
  const turns = []
  for (const m of visible) {
    if (m.role === "assistant" && turns.at(-1)?.role === "assistant") turns.at(-1).items.push(m)
    else turns.push(m.role === "user" ? m : { id: m.id, role: "assistant", items: [m] })
  }
  if ((streaming || working) && turns.at(-1)?.role !== "assistant") turns.push({ id: "live", role: "assistant", items: [] })
  const lastTurn = turns.at(-1)

  return (
    <div className={cn("flex min-w-0 flex-col gap-5 [overflow-wrap:anywhere]", className)}>
      {turns.map((t) =>
        t.role === "user" ? (
          <div
            key={t.id}
            className="ml-10 max-w-full self-end rounded-xl bg-primary px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap text-primary-foreground"
          >
            {t.content}
          </div>
        ) : (
          <div key={t.id} className="grid min-w-0 grid-cols-[1.5rem_minmax(0,1fr)] gap-x-2.5">
            <LogoMark className="size-6" />
            <p className="self-center text-sm font-semibold text-foreground">LandinPage</p>
            <span className="mx-auto mt-1.5 w-px bg-border" aria-hidden />
            <div className="flex min-w-0 flex-col gap-2.5 pt-1.5 pb-1">
              {t.items.map((m) => (
                <Fragment key={m.id}>
                  {m.content && <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{formatText(m.content)}</div>}
                  {m.tool_calls?.length > 0 && (
                    <ul className="flex flex-col gap-1.5">
                      {m.tool_calls.map((call) => (
                        <ToolCard key={call.id} call={call} live={tools[call.id]} status={statusOf(call)} />
                      ))}
                    </ul>
                  )}
                </Fragment>
              ))}
              {t === lastTurn && streaming && <div className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{formatText(streaming)}</div>}
              {t === lastTurn && working && !streaming && (
                <div className="flex items-center gap-1 py-1" role="status" aria-label="Working">
                  {[0, 150, 300].map((d) => (
                    <span key={d} className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      )}
      {error && (
        <Alert variant="destructive" className="min-w-0">
          <AlertCircle />
          <AlertDescription className="line-clamp-6 min-w-0">{error}</AlertDescription>
          {onRetry && (
            <AlertAction>
              <Button variant="outline" size="xs" onClick={onRetry}>
                Retry
              </Button>
            </AlertAction>
          )}
        </Alert>
      )}
      <div ref={end} />
    </div>
  )
}
