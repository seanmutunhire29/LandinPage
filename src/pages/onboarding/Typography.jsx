import { useEffect, useMemo } from "react"
import { useDesignStore } from "@/store/useDesignStore"
import { typographyOptions, recommendedFor } from "@/lib/filters"
import { categoryName, SCALE_STEPS } from "@/data/typography"
import { loadPairing, fontStack } from "@/lib/fonts"
import { StagePage } from "@/components/wizard/WizardLayout"
import { StageHeader } from "@/components/wizard/StageHeader"
import { OptionCard, OptionGrid } from "@/components/wizard/OptionCard"
import { WizardNav } from "@/components/wizard/WizardNav"
import { useStageNav } from "@/components/wizard/useStageNav"

function PairingPreview({ pairing }) {
  const heading = { fontFamily: fontStack(pairing.heading.family, pairing.heading.fallback), fontWeight: pairing.heading.weight }
  const body = { fontFamily: fontStack(pairing.body.family, pairing.body.fallback), fontWeight: pairing.body.weight }
  return (
    <div className="flex h-52 flex-col justify-between border-b border-[#eef0f6] bg-[#fbfbfd] p-5 text-brand-navy">
      <div className="flex items-start justify-between gap-3">
        <p className="text-5xl leading-none" style={heading}>Aa</p>
        <ul className="flex items-end gap-1.5" aria-label="Type scale">
          {SCALE_STEPS.map((step) => (
            <li key={step} className="flex flex-col items-center gap-1" title={`${step}: ${pairing.scale[step]}px`}>
              <span className="w-1.5 rounded-full bg-brand/60" style={{ height: pairing.scale[step] * 0.5 }} />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[22px] leading-tight" style={heading}>Design with intent</p>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#4b4d61]" style={body}>
          Every page starts with a decision. This is the body face at reading size, set for long-form copy.
        </p>
      </div>
    </div>
  )
}

export default function Typography() {
  const { direction, typography, setTypography } = useDesignStore()
  const { stage, goBack, goNext } = useStageNav("typography")
  const options = useMemo(() => typographyOptions(direction), [direction])
  const recommended = recommendedFor(direction, "typography")

  useEffect(() => options.forEach(loadPairing), [options])

  return (
    <>
      <StagePage>
        <StageHeader eyebrow="Stage 1" title={stage.title} blurb={stage.blurb} />
        <OptionGrid label="Type pairings">
          {options.map((p) => (
            <OptionCard
              key={p.id}
              selected={typography === p.id}
              recommended={p.id === recommended}
              onSelect={() => setTypography(p.id)}
              title={p.name}
              subtitle={`${categoryName[p.category]} · ${p.ratio.replace("-", " ")} scale · ${p.scale.xs}–${p.scale.display}px`}
            >
              <PairingPreview pairing={p} />
            </OptionCard>
          ))}
        </OptionGrid>
      </StagePage>
      <WizardNav onBack={goBack} onNext={goNext} nextDisabled={!typography} hint={!typography && "Pick a pairing to continue"} />
    </>
  )
}
