import { useSearchParams } from "react-router-dom"
import { useDesignStore } from "@/store/useDesignStore"
import { componentOptions, recommendedFor } from "@/lib/filters"
import { COMPONENT_CATEGORIES } from "@/data/components"
import { resolveTheme } from "@/lib/theme"
import { StagePage } from "@/components/wizard/WizardLayout"
import { StageHeader } from "@/components/wizard/StageHeader"
import { OptionCard, OptionGrid } from "@/components/wizard/OptionCard"
import { WizardNav } from "@/components/wizard/WizardNav"
import { SubStepper } from "@/components/wizard/SubStepper"
import { useStageNav } from "@/components/wizard/useStageNav"
import { ThemeScope } from "@/components/wizard/ThemeScope"
import { ComponentPreview } from "@/components/previews/ComponentPreviews"

export default function Components() {
  const state = useDesignStore()
  const { direction, components, setComponent } = state
  const { goBack, goNext } = useStageNav("components")
  const [params, setParams] = useSearchParams()

  // Honor ?c=<category>, but never past the first category still missing a pick.
  const requested = Math.max(0, COMPONENT_CATEGORIES.findIndex((c) => c.id === params.get("c")))
  const firstOpen = COMPONENT_CATEGORIES.findIndex((c) => !components[c.id])
  const index = firstOpen === -1 ? requested : Math.min(requested, firstOpen)
  const category = COMPONENT_CATEGORIES[index]
  const options = componentOptions(direction, category.id)
  const recommended = recommendedFor(direction, "components")?.[category.id]
  const selected = components[category.id]
  const theme = resolveTheme(state)

  const go = (i) => {
    setParams({ c: COMPONENT_CATEGORIES[i].id })
    window.scrollTo({ top: 0 })
  }
  // A category is reachable once every category before it has a pick.
  const canJump = (_, i) => COMPONENT_CATEGORIES.slice(0, i).every((c) => components[c.id])

  return (
    <>
      <StagePage>
        <StageHeader
          eyebrow={`Stage 4 · ${index + 1} of ${COMPONENT_CATEGORIES.length}`}
          title={category.name}
          blurb={`${category.blurb} Each option is a live component in your type, color and surface.`}
        />
        <SubStepper
          label="Component categories"
          steps={COMPONENT_CATEGORIES}
          currentIndex={index}
          onJump={go}
          canJump={canJump}
          isDone={(c) => Boolean(components[c.id])}
        />
        <OptionGrid label={category.name} cols={category.wide ? "md:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}>
          {options.map((v) => (
            <OptionCard
              key={v.id}
              selected={selected === v.id}
              recommended={v.id === recommended}
              onSelect={() => setComponent(category.id, v.id)}
              title={v.name}
            >
              <ThemeScope theme={theme}>
                <ComponentPreview category={category.id} variant={v.id} />
              </ThemeScope>
            </OptionCard>
          ))}
        </OptionGrid>
      </StagePage>
      <WizardNav
        onBack={() => (index > 0 ? go(index - 1) : goBack())}
        onNext={() => (index < COMPONENT_CATEGORIES.length - 1 ? go(index + 1) : goNext())}
        nextDisabled={!selected}
        nextLabel={index < COMPONENT_CATEGORIES.length - 1 ? `Next: ${COMPONENT_CATEGORIES[index + 1].name}` : "Next"}
        hint={!selected && `Pick a ${category.name.toLowerCase()} style to continue`}
      />
    </>
  )
}
