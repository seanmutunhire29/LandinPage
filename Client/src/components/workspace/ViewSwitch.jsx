import { useRef } from "react"
import { cn } from "@/lib/utils"

/**
 * Segmented control with a sliding brand indicator. Segments are equal width so
 * the indicator can move by whole steps. Arrow keys move the selection.
 */
export function ViewSwitch({ options, value, onChange, label }) {
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
      className="relative grid rounded-[calc(var(--radius)*0.9)] bg-[#f1f2f8] p-[3px] ring-1 ring-[#e3e5f0] ring-inset"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden
        className="absolute inset-y-[3px] left-[3px] rounded-md bg-brand shadow-[0_1px_2px_rgb(24_27_52/0.12),0_4px_12px_-4px_rgb(97_97_255/0.55)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ width: `calc((100% - 6px) / ${options.length})`, transform: `translateX(${index * 100}%)` }}
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
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(id)}
            className={cn(
              "relative z-10 inline-flex h-7 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1",
              active ? "text-white" : "text-[#676879] hover:text-brand-navy"
            )}
          >
            <Icon className="size-3.5" strokeWidth={2.25} />
            <span className="hidden md:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
