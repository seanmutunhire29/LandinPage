import { useEffect, useRef } from "react"
import { Bot, CheckCircle2, Loader2, XCircle } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { cleanOutput } from "@/webcontainer/runtime"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

/** Read-only log of every command run in the WebContainer (system and agent). */
export function Terminal() {
  const entries = useWorkspaceStore((s) => s.terminal)
  const end = useRef(null)

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" })
  }, [entries])

  return (
    <ScrollArea className="h-full bg-muted/40 font-mono text-xs leading-relaxed text-muted-foreground [&>[data-slot=scroll-area-viewport]>div]:block!">
      <div className="p-3">
        {entries.length === 0 && <p className="text-muted-foreground">Commands will appear here.</p>}
        {entries.map((t) => (
          <div key={t.id} className="mb-3">
            <div className="flex items-center gap-2 text-foreground">
              {t.status === "running" ? (
                <Loader2 className="size-3 shrink-0 animate-spin text-muted-foreground" />
              ) : t.status === "ok" ? (
                <CheckCircle2 className="size-3 shrink-0 text-success" />
              ) : (
                <XCircle className="size-3 shrink-0 text-destructive" />
              )}
              <span className="text-success">$</span> {t.command}
              {t.source === "agent" && (
                <Badge variant="outline" className="font-sans text-muted-foreground">
                  <Bot /> agent
                </Badge>
              )}
            </div>
            {t.output && <pre className="mt-1 max-h-60 overflow-y-auto whitespace-pre-wrap">{cleanOutput(t.output).trim().split("\n").slice(-40).join("\n")}</pre>}
          </div>
        ))}
        <div ref={end} />
      </div>
    </ScrollArea>
  )
}
