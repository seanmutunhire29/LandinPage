import { Link } from "react-router-dom"
import { Check } from "lucide-react"
import { STAGES } from "@/data/stages"
import { useDesignStore } from "@/store/useDesignStore"
import { canVisit, isStageComplete } from "@/lib/progress"
import { cn } from "@/lib/utils"

/** Segmented step indicator; reachable stages are links. */
export function ProgressIndicator({ currentIndex }) {
  const state = useDesignStore()
  const total = STAGES.length
  const remaining = total - currentIndex - 1

  return (
    <nav aria-label="Onboarding progress" className="w-full min-w-0">
      <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <span className="min-w-0 truncate font-medium text-foreground">
          Step {currentIndex + 1} of {total}
          <span className="font-normal text-muted-foreground"> · {STAGES[currentIndex].label}</span>
        </span>
        <span className="shrink-0 text-muted-foreground">{remaining === 0 ? "Last step" : `${remaining} to go`}</span>
      </div>
      <ol className="flex gap-1">
        {STAGES.map((stage, i) => {
          const done = i < currentIndex || (i !== currentIndex && isStageComplete(stage.id, state) && canVisit(i, state))
          const reachable = canVisit(i, state)
          const current = i === currentIndex
          const segment = (
            <>
              <span className={cn("block h-1.5 rounded-full transition-colors", current || done ? "bg-primary" : "bg-muted")} />
              <span
                className={cn(
                  "mt-1.5 hidden items-center gap-1 text-xs lg:flex",
                  current ? "font-medium text-foreground" : "text-muted-foreground"
                )}
              >
                {done && !current && <Check className="size-3" strokeWidth={3} />}
                {stage.label}
              </span>
            </>
          )
          return (
            <li key={stage.id} className="min-w-0 flex-1">
              {reachable && !current ? (
                <Link
                  to={stage.path}
                  className="block rounded-sm outline-none hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-label={`Go to ${stage.label}`}
                >
                  {segment}
                </Link>
              ) : (
                <div aria-current={current ? "step" : undefined}>{segment}</div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
