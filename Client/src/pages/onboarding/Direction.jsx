import { useMemo } from "react"
import { DIRECTIONS } from "@/data/directions"
import { useDesignStore } from "@/store/useDesignStore"
import { resolveTheme } from "@/lib/theme"
import { StagePage } from "@/components/wizard/WizardLayout"
import { StageHeader } from "@/components/wizard/StageHeader"
import { OptionCard, OptionGrid } from "@/components/wizard/OptionCard"
import { WizardNav } from "@/components/wizard/WizardNav"
import { useStageNav } from "@/components/wizard/useStageNav"
import { DirectionThumb } from "@/components/previews/DirectionThumb"

export default function Direction() {
  const direction = useDesignStore((s) => s.direction)
  const setDirection = useDesignStore((s) => s.setDirection)
  const { stage, goBack, goNext } = useStageNav("direction")

  // Thumbnails always show each direction's own defaults, never the user's picks.
  const themes = useMemo(
    () => Object.fromEntries(DIRECTIONS.map((d) => [d.id, resolveTheme({}, { direction: d.id, ...d.defaults })])),
    []
  )

  return (
    <>
      <StagePage>
        <StageHeader eyebrow="Stage 0" title={stage.title} blurb={stage.blurb} />
        <OptionGrid label="Directions">
          {DIRECTIONS.map((d) => (
            <OptionCard
              key={d.id}
              selected={direction === d.id}
              onSelect={() => setDirection(d.id)}
              title={d.name}
              subtitle={d.blurb}
            >
              <DirectionThumb theme={themes[d.id]} />
            </OptionCard>
          ))}
        </OptionGrid>
      </StagePage>
      <WizardNav
        onBack={goBack}
        backLabel="Home"
        onNext={goNext}
        nextDisabled={!direction}
        hint={direction ? "Changing this later will reset any choices that no longer fit." : "Pick a direction to continue"}
      />
    </>
  )
}
