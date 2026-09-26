import { useEffect, useRef } from "react"
import { Bot, CheckCircle2, Loader2, XCircle } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { cleanOutput } from "@/webcontainer/runtime"

/** Read-only log of every command run in the WebContainer (system and agent). */
export function Terminal() {
  const entries = useWorkspaceStore((s) => s.terminal)
  const end = useRef(null)

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" })
  }, [entries])

  return (
    <div className="h-full overflow-y-auto bg-brand-navy p-3 font-mono text-xs leading-relaxed text-white/70">
      {entries.length === 0 && <p className="text-white/30">Commands will appear here.</p>}
      {entries.map((t) => (
        <div key={t.id} className="mb-3">
          <div className="flex items-center gap-2 text-white">
            {t.status === "running" ? (
              <Loader2 className="size-3 animate-spin text-brand-blue" />
            ) : t.status === "ok" ? (
              <CheckCircle2 className="size-3 text-brand-green" />
            ) : (
              <XCircle className="size-3 text-brand-red" />
            )}
            <span className="text-brand-green">$</span> {t.command}
            {t.source === "agent" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-1.5 text-xs text-white/60">
                <Bot className="size-2.5" /> agent
              </span>
            )}
          </div>
          {t.output && <pre className="mt-1 max-h-60 overflow-y-auto whitespace-pre-wrap text-white/50">{cleanOutput(t.output).trim().split("\n").slice(-40).join("\n")}</pre>}
        </div>
      ))}
      <div ref={end} />
    </div>
  )
}
