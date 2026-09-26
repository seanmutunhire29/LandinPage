import { useRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Pill segmented control with a springy sliding clay indicator: the app's toggle for
 * picking one of a few options. Segments are equal width so the indicator can move
 * by whole steps. Arrow keys move the selection. Options with an `Icon` show only
 * the icon below md; `iconOnly` hides the text labels at every size.
 */
export function Segmented({ options, value, onChange, label, iconOnly = false, className }) {
  const refs = useRef([])
  const index = Math.max(0, options.findIndex((o) => o.id === value))

  const onKeyDown = (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]
    if (!step) return
    e.preventDefault()
    const next = (index + step + options.length) % options.length
    onChange(options[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("relative grid rounded-full bg-brand-fill p-1 shadow-clay-inset", className)}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 rounded-full bg-brand shadow-brand-sm transition-transform duration-450 ease-spring"
        style={{ width: `calc((100% - 8px) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
      />
      {options.map(({ id, label, Icon }, i) => {
        const active = i === index
        return (
          <button
            key={id}
            ref={(el) => (refs.current[i] = el)}
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={iconOnly ? label : undefined}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(id)}
            className={cn(
              "relative z-10 inline-flex h-7 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-bold whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-4 focus-visible:ring-brand/30",
              active ? "text-brand-navy" : "text-brand-muted hover:text-brand-navy"
            )}
          >
            {Icon && <Icon className="size-3.5" strokeWidth={2.25} />}
            {!iconOnly && <span className={cn(Icon && "hidden md:inline")}>{label}</span>}
          </button>
        )
      })}
    </div>
  )
}
