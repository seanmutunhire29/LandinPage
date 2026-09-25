import { Link } from "react-router-dom"
import { Check } from "lucide-react"
import { STAGES } from "@/data/stages"
import { useDesignStore } from "@/store/useDesignStore"
import { canVisit, isStageComplete } from "@/lib/progress"
import { cn } from "@/lib/utils"

export function ProgressIndicator({ currentIndex }) {
  const state = useDesignStore()
  const total = STAGES.length
  const remaining = total - currentIndex - 1

  return (
    <nav aria-label="Onboarding progress" className="w-full">
      <div className="mb-2 flex items-baseline justify-between text-sm">
        <span className="font-semibold text-brand-navy">
          Step {currentIndex + 1} of {total}
          <span className="font-normal text-[#676879]"> · {STAGES[currentIndex].label}</span>
        </span>
        <span className="text-[#676879]">{remaining === 0 ? "Last step" : `${remaining} to go`}</span>
      </div>
      <ol className="flex gap-1.5">
        {STAGES.map((stage, i) => {
          const done = i < currentIndex || (i !== currentIndex && isStageComplete(stage.id, state) && canVisit(i, state))
          const reachable = canVisit(i, state)
          const current = i === currentIndex
          const segment = (
            <>
              <span
                className={cn(
                  "block h-2 rounded-full transition-colors",
                  current ? "bg-brand" : done ? "bg-brand/45" : "bg-[#e3e5f0]"
                )}
              />
              <span
                className={cn(
                  "mt-1.5 hidden items-center gap-1 text-xs lg:flex",
                  current ? "font-semibold text-brand-navy" : "text-[#676879]"
                )}
              >
                {done && !current && <Check className="size-3 text-brand" strokeWidth={3} />}
                {stage.label}
              </span>
            </>
          )
          return (
            <li key={stage.id} className="flex-1">
              {reachable && !current ? (
                <Link to={stage.path} className="block rounded outline-none focus-visible:ring-2 focus-visible:ring-brand" aria-label={`Go to ${stage.label}`}>
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
