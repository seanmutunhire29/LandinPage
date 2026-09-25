import { ThemeScope } from "@/components/wizard/ThemeScope"

/**
 * Stage 0 thumbnail: the direction's default type, palette and surface,
 * rendered as real values rather than a description.
 */
export function DirectionThumb({ theme }) {
  const { colors, headingStyle, cardStyle, controlStyle, surface, gradient, cardClass, pairing } = theme
  const swatches = [colors.primary, colors.secondary, colors.accent, colors.text, colors.background]
  return (
    <ThemeScope theme={theme}>
      <div className="relative flex h-40 gap-3 overflow-hidden p-4" style={{ background: surface.backdrop ? gradient : colors.background }}>
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <p className="truncate text-[34px] leading-none" style={headingStyle}>Aa</p>
            <p className="mt-1.5 truncate text-[11px] text-muted-foreground">{pairing.heading.family}</p>
          </div>
          <div className="flex h-4 overflow-hidden rounded-full ring-1 ring-foreground/10">
            {swatches.map((c, i) => (
              <span key={i} className="flex-1" style={{ background: c }} />
            ))}
          </div>
        </div>
        <div className={`flex w-[52%] flex-col justify-between rounded-xl p-3 ${cardClass}`} style={cardStyle}>
          <div className="flex flex-col gap-1.5">
            <div className="h-2 w-4/5 rounded-full bg-foreground/70" />
            <div className="h-1.5 w-full rounded-full bg-foreground/20" />
            <div className="h-1.5 w-2/3 rounded-full bg-foreground/20" />
          </div>
          <span
            className="inline-flex h-6 w-fit items-center rounded-lg bg-primary px-2.5 text-[10px] font-semibold text-primary-foreground"
            style={controlStyle}
          >
            Action
          </span>
        </div>
      </div>
    </ThemeScope>
  )
}
