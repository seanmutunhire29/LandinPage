import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/** Chip row for sub-steps inside a stage (component categories, layout phases). */
export function SubStepper({ steps, currentIndex, onJump, isDone, canJump = () => true, label }) {
  return (
    <div role="tablist" aria-label={label} className="mb-8 flex flex-wrap gap-2">
      {steps.map((step, i) => {
        const current = i === currentIndex
        const done = isDone?.(step, i)
        const enabled = canJump(step, i)
        return (
          <button
            key={step.id}
            role="tab"
            aria-selected={current}
            disabled={!enabled}
            onClick={() => onJump(i)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-bold transition-[transform,background-color,box-shadow] duration-200 ease-spring enabled:hover:scale-[1.04] enabled:active:scale-95",
              current
                ? "bg-brand text-brand-navy shadow-brand-sm"
                : done
                  ? "bg-white text-brand-navy shadow-clay-sm"
                  : "bg-brand-fill text-brand-muted shadow-clay-inset",
              !enabled && "cursor-not-allowed opacity-50"
            )}
          >
            {done && !current ? <Check className="size-3.5 text-brand-dark" strokeWidth={3} /> : <span className="text-xs opacity-60">{i + 1}</span>}
            {step.name}
          </button>
        )
      })}
    </div>
  )
}
