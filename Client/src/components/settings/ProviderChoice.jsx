import { ProviderTile } from "@/components/account/UserAvatar"
import { cn } from "@/lib/utils"

/**
 * Card-style provider picker (aria-pressed buttons). `isConnected(id)` drives the key
 * status line; the provider tile keeps its brand colour.
 */
export function ProviderChoice({ providers, activeId, isConnected, onChoose }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {providers.map((p) => {
        const active = activeId === p.id
        const connected = isConnected(p.id)
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChoose(p)}
            aria-pressed={active}
            className={cn(
              "flex min-w-0 flex-col items-start gap-2 rounded-xl border bg-card p-3 text-left transition-colors outline-none hover:bg-accent/50 focus-visible:ring-3 focus-visible:ring-ring/50",
              active && "border-primary bg-accent/50 ring-1 ring-primary"
            )}
          >
            <ProviderTile provider={p.id} />
            <span className="max-w-full truncate text-sm font-medium">{p.label}</span>
            <span className={cn("text-xs font-medium", connected ? "text-success" : "text-muted-foreground")}>{connected ? "Key connected" : "No key yet"}</span>
          </button>
        )
      })}
    </div>
  )
}
