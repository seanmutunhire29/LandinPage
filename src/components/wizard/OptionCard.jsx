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
        "group relative flex flex-col overflow-hidden rounded-2xl border-2 bg-white text-left transition-all outline-none",
        "hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(24,27,52,0.25)] focus-visible:ring-4 focus-visible:ring-brand/30",
        disabled ? "cursor-default" : "cursor-pointer",
        selected ? "border-brand shadow-[0_12px_32px_-12px_rgba(97,97,255,0.5)]" : "border-transparent ring-1 ring-[#e3e5f0]",
        className
      )}
    >
      {children && <div className="relative">{children}</div>}
      <div className="flex items-start gap-3 px-4 pt-3 pb-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-[15px] leading-tight font-semibold text-brand-navy">{title}</h3>
            {recommended && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-yellow/25 px-2 py-0.5 text-[11px] font-semibold text-[#8a6d00]">
                <Sparkles className="size-3" /> Recommended
              </span>
            )}
            {badges}
          </div>
          {subtitle && <p className="mt-1 text-[13px] leading-snug text-[#676879]">{subtitle}</p>}
          {footer}
        </div>
        <span
          aria-hidden
          className={cn(
            "mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
            role === "checkbox" && "rounded-md",
            selected ? "border-brand bg-brand text-white" : "border-[#d7d9e6] text-transparent group-hover:border-brand/50"
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
