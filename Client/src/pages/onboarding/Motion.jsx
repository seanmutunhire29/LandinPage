import { useDesignStore } from "@/store/useDesignStore"
import { motionOptions, recommendedFor } from "@/lib/filters"
import { resolveTheme } from "@/lib/theme"
import { StagePage } from "@/components/wizard/WizardLayout"
import { StageHeader } from "@/components/wizard/StageHeader"
import { OptionCard, OptionGrid } from "@/components/wizard/OptionCard"
import { WizardNav } from "@/components/wizard/WizardNav"
import { useStageNav } from "@/components/wizard/useStageNav"
import { ThemeScope } from "@/components/wizard/ThemeScope"
import { MotionDemo } from "@/components/previews/MotionDemo"

export default function Motion() {
  const state = useDesignStore()
  const { direction, motion, setMotion } = state
  const { stage, goBack, goNext } = useStageNav("motion")
  const options = motionOptions(direction)
  const recommended = recommendedFor(direction, "motion")
  const theme = resolveTheme(state)
  const timing = theme.direction.motionTiming ?? 1

  return (
    <>
      <StagePage>
        <StageHeader eyebrow="Stage 6" title={stage.title} blurb={stage.blurb} />
        {timing !== 1 && (
          <p className="-mt-4 mb-6 text-sm text-[#676879]">
            {theme.direction.name} runs every duration at {timing}× speed for a slower, more deliberate feel.
          </p>
        )}
        <OptionGrid label="Motion presets" cols={options.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}>
          {options.map((m) => (
            <OptionCard
              key={m.id}
              selected={motion === m.id}
              recommended={m.id === recommended}
              onSelect={() => setMotion(m.id)}
              title={m.name}
              subtitle={m.blurb}
              footer={
                <p className="mt-1.5 font-mono text-[11px] text-[#9699a6]">
                  {Math.round(m.durationScale.base * timing)}ms · {m.easing}
                </p>
              }
            >
              <ThemeScope theme={theme}>
                <MotionDemo preset={m} timing={timing} />
              </ThemeScope>
            </OptionCard>
          ))}
        </OptionGrid>
      </StagePage>
      <WizardNav onBack={goBack} onNext={goNext} nextDisabled={!motion} nextLabel="Continue" hint={!motion && "Pick a motion style to continue"} />
    </>
  )
}
