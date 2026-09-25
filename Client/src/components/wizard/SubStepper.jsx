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
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              current
                ? "border-brand-navy bg-brand-navy text-white"
                : done
                  ? "border-brand/30 bg-brand/10 text-brand-navy hover:bg-brand/15"
                  : "border-[#e3e5f0] bg-white text-[#676879] hover:border-[#c5c7d4]",
              !enabled && "cursor-not-allowed opacity-50"
            )}
          >
            {done && !current ? <Check className="size-3.5 text-brand" strokeWidth={3} /> : <span className="text-xs opacity-60">{i + 1}</span>}
            {step.name}
          </button>
        )
      })}
    </div>
  )
}
