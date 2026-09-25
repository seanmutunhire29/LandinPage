import { Fragment, useEffect, useRef } from "react"
import { AlertCircle, CheckCircle2, FilePen, FileSearch, Globe, Loader2, Plug, Sparkles, SquareTerminal, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

/** Minimal inline formatting for agent replies: `code` and **bold**. */
function formatText(text) {
  return text.split(/(`[^`\n]+`|\*\*[^*\n]+\*\*)/g).map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 2)
      return <code key={i} className="rounded bg-[#eef0fb] px-1 py-0.5 font-mono text-[0.85em] text-brand-navy">{part.slice(1, -1)}</code>
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

function describeTool(name, args) {
  if (name === "Write") return { Icon: FilePen, label: `Wrote ${args.file_path ?? "file"}` }
  if (name === "Edit") return { Icon: FilePen, label: `Edited ${args.file_path ?? "file"}` }
  if (name === "Read") return { Icon: FileSearch, label: `Read ${args.file_path ?? "file"}` }
  if (name === "Bash") return { Icon: SquareTerminal, label: args.command ?? "command", mono: true }
  if (name === "WebSearch") return { Icon: Globe, label: `Searched "${args.query ?? ""}"` }
  if (name?.startsWith("mcp__")) return { Icon: Plug, label: name.split("__").slice(1).join(" / ") }
  return { Icon: Sparkles, label: name }
}

function ToolChip({ call, live }) {
  const name = call.function?.name
  const { Icon, label, mono } = describeTool(name, live?.args ?? parseArgs(call))
  const status = live?.status
  return (
    <li className="flex items-center gap-2 rounded-lg bg-[#f6f7fb] px-2.5 py-1.5 text-xs text-[#676879] ring-1 ring-[#e3e5f0]" title={live?.summary}>
      <Icon className="size-3.5 shrink-0 text-brand" />
      <span className={cn("min-w-0 flex-1 truncate", mono && "font-mono")}>{label}</span>
      {status === "running" && <Loader2 className="size-3.5 shrink-0 animate-spin text-brand" />}
      {status === "ok" && <CheckCircle2 className="size-3.5 shrink-0 text-brand-green" />}
      {status === "error" && <XCircle className="size-3.5 shrink-0 text-brand-red" />}
    </li>
  )
}

export function MessageList({ messages, streaming = "", working = false, tools = {}, error, onRetry, className }) {
  const end = useRef(null)
  const visible = messages.filter((m) => m.role === "user" || (m.role === "assistant" && (m.content || m.tool_calls?.length)))

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }, [visible.length, streaming, working, tools])

  return (
    <div className={cn("flex min-w-0 flex-col gap-4 [overflow-wrap:anywhere]", className)}>
      {visible.map((m) =>
        m.role === "user" ? (
          <div key={m.id} className="ml-8 max-w-full self-end rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-[15px] whitespace-pre-wrap text-white">
            {m.content}
          </div>
        ) : (
          <div key={m.id} className="mr-4 flex min-w-0 flex-col gap-2">
            {m.content && <div className="text-[15px] leading-relaxed whitespace-pre-wrap text-brand-navy">{formatText(m.content)}</div>}
            {m.tool_calls?.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {m.tool_calls.map((call) => (
                  <ToolChip key={call.id} call={call} live={tools[call.id]} />
                ))}
              </ul>
            )}
          </div>
        )
      )}
      {streaming && <div className="mr-4 text-[15px] leading-relaxed whitespace-pre-wrap text-brand-navy">{formatText(streaming)}</div>}
      {working && !streaming && (
        <div className="flex items-center gap-2 text-sm text-[#676879]">
          <Loader2 className="size-4 animate-spin text-brand" /> Working...
        </div>
      )}
      {error && (
        <div role="alert" className="flex min-w-0 items-start gap-2 rounded-xl bg-[#fff0f2] px-3 py-2.5 text-sm text-[#b3263e] ring-1 ring-[#ffd0d8]">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <p className="line-clamp-6 min-w-0 flex-1">{error}</p>
          {onRetry && (
            <button onClick={onRetry} className="shrink-0 font-semibold underline hover:no-underline">
              Retry
            </button>
          )}
        </div>
      )}
      <div ref={end} />
    </div>
  )
}
