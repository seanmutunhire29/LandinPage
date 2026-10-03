import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Sub-step switcher inside a stage (component categories, layout phases).
 * Styled like a shadcn TabsList; kept as plain role="tab" buttons because the
 * chips don't wrap panels and jumping is driven by the page's URL state.
 */
export function SubStepper({ steps, currentIndex, onJump, isDone, canJump = () => true, label }) {
  return (
    <div role="tablist" aria-label={label} className="mb-8 inline-flex max-w-full flex-wrap items-center gap-0.5 rounded-lg bg-muted p-[3px] text-muted-foreground">
      {steps.map((step, i) => {
        const current = i === currentIndex
        const done = isDone?.(step, i)
        const enabled = canJump(step, i)
        return (
          <button
            key={step.id}
            type="button"
            role="tab"
            aria-selected={current}
            disabled={!enabled}
            onClick={() => onJump(i)}
            className={cn(
              "inline-flex h-7 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all outline-none",
              "hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground",
              current && "bg-background text-foreground shadow-sm dark:border-input dark:bg-input/30 dark:text-foreground"
            )}
          >
            {done && !current ? <Check className="size-3.5" strokeWidth={3} /> : <span className="text-xs opacity-60">{i + 1}</span>}
            {step.name}
          </button>
        )
      })}
    </div>
  )
}
