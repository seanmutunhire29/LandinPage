import { Check, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Selectable option tile. Uses role="radio" by default so a grid of cards
 * behaves like a radio group; pass role="checkbox" for multi-select grids.
 * Stays hand-built (not RadioGroup) because each card hosts a live preview.
 */
export function OptionCard({ selected, recommended, onSelect, title, subtitle, children, className, footer, role = "radio", badges, disabled }) {
  const select = () => !disabled && onSelect()
  const handleKey = (e) => {
    // Ignore keys typed into live previews (inputs, switches) nested in the card.
    if (e.target !== e.currentTarget) return
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      select()
    }
  }
  return (
    <div
      role={role}
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      tabIndex={0}
      onClick={select}
      onKeyDown={handleKey}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card text-left text-card-foreground transition-colors outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        disabled ? "cursor-default" : "cursor-pointer hover:bg-accent/40",
        selected && "border-primary ring-1 ring-primary",
        className
      )}
    >
      {children && <div className="relative border-b">{children}</div>}
      <div className="flex items-start gap-3 px-4 pt-3 pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm leading-tight font-semibold">{title}</h3>
            {recommended && (
              <Badge variant="outline">
                <Sparkles /> Recommended
              </Badge>
            )}
            {badges}
          </div>
          {subtitle && <p className="mt-1 text-sm leading-snug text-muted-foreground">{subtitle}</p>}
          {footer}
        </div>
        <span
          aria-hidden
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border transition-colors",
            role === "checkbox" && "rounded-md",
            selected ? "border-primary bg-primary text-primary-foreground" : "border-input bg-background text-transparent",
            disabled && "opacity-50"
          )}
        >
          <Check className="size-3" strokeWidth={3} />
        </span>
      </div>
    </div>
  )
}

export function OptionGrid({ children, label, cols = "sm:grid-cols-2 lg:grid-cols-3", className, role = "radiogroup" }) {
  return (
    <div role={role} aria-label={label} className={cn("grid grid-cols-1 gap-4", cols, className)}>
      {children}
    </div>
  )
}
