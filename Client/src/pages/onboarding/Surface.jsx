import { Lock } from "lucide-react"
import { useDesignStore } from "@/store/useDesignStore"
import { surfaceOptions, recommendedFor } from "@/lib/filters"
import { resolveTheme } from "@/lib/theme"
import { StagePage } from "@/components/wizard/WizardLayout"
import { StageHeader } from "@/components/wizard/StageHeader"
import { OptionCard, OptionGrid } from "@/components/wizard/OptionCard"
import { WizardNav } from "@/components/wizard/WizardNav"
import { useStageNav } from "@/components/wizard/useStageNav"
import { ThemeScope } from "@/components/wizard/ThemeScope"
import { SurfaceSample } from "@/components/previews/SurfaceSample"
import { directionById } from "@/data/directions"

export default function Surface() {
  const state = useDesignStore()
  const { direction, surface, setSurface } = state
  const { stage, goBack, goNext } = useStageNav("surface")
  const options = surfaceOptions(direction)
  const locked = options.length === 1
  const recommended = recommendedFor(direction, "surface")

  return (
    <>
      <StagePage>
        <StageHeader eyebrow="Stage 3" title={stage.title} blurb={stage.blurb} />
        {locked && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-white p-4 shadow-clay-sm">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand-dark">
              <Lock className="size-4" />
            </span>
            <p className="text-[15px] text-brand-body">
              <strong className="text-brand-navy">Set by your direction.</strong> {directionById[direction].name} only works with one
              surface. A mismatched material (like brutalist + glass) breaks the look, so this one is chosen for you.
            </p>
          </div>
        )}
        <OptionGrid label="Surfaces" cols={locked ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}>
          {options.map((s) => {
            const theme = resolveTheme(state, { surface: s.id })
            return (
              <OptionCard
                key={s.id}
                selected={surface === s.id}
                recommended={!locked && s.id === recommended}
                onSelect={() => setSurface(s.id)}
                title={s.name}
                subtitle={s.blurb}
                footer={
                  <p className="mt-1.5 text-[11px] text-brand-subtle">
                    Radius {theme.radii.md}px{s.blur ? ` · blur ${s.blur}px` : ""}{s.texture ? " · grain texture" : ""}
                  </p>
                }
              >
                <ThemeScope theme={theme}>
                  <SurfaceSample theme={theme} />
                </ThemeScope>
              </OptionCard>
            )
          })}
        </OptionGrid>
      </StagePage>
      <WizardNav onBack={goBack} onNext={goNext} nextDisabled={!surface} hint={!surface && "Pick a surface to continue"} />
    </>
  )
}
