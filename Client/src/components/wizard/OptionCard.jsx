import { Check, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Selectable option tile. Uses role="radio" by default so a grid of cards
 * behaves like a radio group; pass role="checkbox" for multi-select grids.
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
        "group relative flex flex-col overflow-hidden rounded-[26px] bg-white text-left transition-[transform,box-shadow] duration-200 ease-spring outline-none",
        "hover:scale-[1.02] hover:shadow-clay active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-brand/40",
        disabled ? "cursor-default" : "cursor-pointer",
        selected ? "shadow-clay ring-[3px] ring-brand" : "shadow-clay-sm",
        className
      )}
    >
      {children && <div className="relative">{children}</div>}
      <div className="flex items-start gap-3 px-4 pt-3 pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-[15px] leading-tight font-semibold text-brand-navy">{title}</h3>
            {recommended && (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold text-warning ring-[1.5px] ring-brand-yellow">
                <Sparkles className="size-3" /> Recommended
              </span>
            )}
            {badges}
          </div>
          {subtitle && <p className="mt-1 text-[13px] leading-snug text-brand-muted">{subtitle}</p>}
          {footer}
        </div>
        <span
          aria-hidden
          className={cn(
            "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full transition-[transform,background-color] duration-200 ease-spring",
            role === "checkbox" && "rounded-lg",
            selected ? "scale-110 bg-brand text-brand-navy shadow-brand-sm" : "bg-brand-fill text-transparent shadow-clay-inset"
          )}
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      </div>
    </div>
  )
}

export function OptionGrid({ children, label, cols = "sm:grid-cols-2 lg:grid-cols-3", className, role = "radiogroup" }) {
  return (
    <div role={role} aria-label={label} className={cn("grid grid-cols-1 gap-5", cols, className)}>
      {children}
    </div>
  )
}
