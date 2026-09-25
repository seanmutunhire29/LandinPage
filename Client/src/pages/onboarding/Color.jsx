import { useDesignStore } from "@/store/useDesignStore"
import { paletteOptions, recommendedFor } from "@/lib/filters"
import { moodName } from "@/data/palettes"
import { resolveTheme } from "@/lib/theme"
import { StagePage } from "@/components/wizard/WizardLayout"
import { StageHeader } from "@/components/wizard/StageHeader"
import { OptionCard, OptionGrid } from "@/components/wizard/OptionCard"
import { WizardNav } from "@/components/wizard/WizardNav"
import { useStageNav } from "@/components/wizard/useStageNav"
import { ThemeScope } from "@/components/wizard/ThemeScope"
import { Button } from "@/components/ui/button"

const ROLES = ["primary", "secondary", "accent", "background", "surface", "text", "textMuted", "border", "success", "warning", "error"]

function PalettePreview({ theme }) {
  const { colors, headingStyle, palette } = theme
  return (
    <ThemeScope theme={theme}>
      <div className="p-4" style={{ background: palette.gradient && !palette.dark ? `${palette.gradient}` : colors.background }}>
        <div className="rounded-xl p-4" style={{ background: colors.surface, border: `1px solid ${colors.border}` }}>
          <p className="text-lg leading-tight" style={headingStyle}>Launch faster</p>
          <p className="mt-1 text-[13px] text-muted-foreground">Muted text sits comfortably on the surface.</p>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" tabIndex={-1}>Primary</Button>
            <Button size="sm" variant="secondary" tabIndex={-1}>Secondary</Button>
            <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-foreground">Accent</span>
          </div>
        </div>
      </div>
      <div className="flex h-7" role="list" aria-label="Color roles">
        {ROLES.map((role) => (
          <span key={role} role="listitem" className="group/sw relative flex-1" style={{ background: colors[role] }} title={`${role}: ${colors[role]}`}>
            <span className="sr-only">{`${role} ${colors[role]}`}</span>
          </span>
        ))}
      </div>
    </ThemeScope>
  )
}

export default function Color() {
  const state = useDesignStore()
  const { direction, palette, setPalette } = state
  const { stage, goBack, goNext } = useStageNav("color")
  const options = paletteOptions(direction)
  const recommended = recommendedFor(direction, "palette")

  return (
    <>
      <StagePage>
        <StageHeader eyebrow="Stage 2" title={stage.title} blurb={stage.blurb} />
        <OptionGrid label="Palettes">
          {options.map((p) => (
            <OptionCard
              key={p.id}
              selected={palette === p.id}
              recommended={p.id === recommended}
              onSelect={() => setPalette(p.id)}
              title={p.name}
              subtitle={moodName[p.mood]}
              footer={<p className="mt-1.5 text-[11px] text-[#9699a6]">Source: {p.source}</p>}
            >
              <PalettePreview theme={resolveTheme(state, { palette: p.id })} />
            </OptionCard>
          ))}
        </OptionGrid>
      </StagePage>
      <WizardNav onBack={goBack} onNext={goNext} nextDisabled={!palette} hint={!palette && "Pick a palette to continue"} />
    </>
  )
}
