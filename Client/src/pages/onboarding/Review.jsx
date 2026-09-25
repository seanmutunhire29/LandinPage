import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Check, Copy, Download, Pencil, RotateCcw } from "lucide-react"
import { useDesignStore } from "@/store/useDesignStore"
import { buildSpec } from "@/lib/buildSpec"
import { highlightJson } from "@/lib/highlightJson"
import { STAGES } from "@/data/stages"
import { componentCategoryById } from "@/data/components"
import { sectionById } from "@/data/sections"
import { StagePage } from "@/components/wizard/WizardLayout"
import { StageHeader } from "@/components/wizard/StageHeader"
import { WizardNav } from "@/components/wizard/WizardNav"
import { useStageNav } from "@/components/wizard/useStageNav"
import { Button } from "@/components/ui/button"

function SummaryItem({ stageId, label, value, children }) {
  const stage = STAGES.find((s) => s.id === stageId)
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white p-4 ring-1 ring-[#e3e5f0]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wide text-[#9699a6] uppercase">{label}</span>
        <Link to={stage.path} className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline" aria-label={`Edit ${label}`}>
          <Pencil className="size-3" /> Edit
        </Link>
      </div>
      <p className="font-display font-semibold text-brand-navy">{value}</p>
      {children}
    </div>
  )
}

export default function Review() {
  const state = useDesignStore()
  const reset = useDesignStore((s) => s.reset)
  const navigate = useNavigate()
  const { stage, goBack } = useStageNav("review")
  const [copied, setCopied] = useState(false)

  const spec = useMemo(() => buildSpec(state), [state])
  const json = useMemo(() => JSON.stringify(spec, null, 2), [spec])
  const highlighted = useMemo(() => highlightJson(json), [json])
  const t = spec.tokens

  const copy = async () => {
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([json], { type: "application/json" }))
    const a = Object.assign(document.createElement("a"), { href: url, download: `landinpage-spec-${spec.meta.direction.id}.json` })
    a.click()
    URL.revokeObjectURL(url)
  }

  const startOver = () => {
    reset()
    navigate("/onboarding/direction")
  }

  return (
    <>
      <StagePage>
        <StageHeader eyebrow="Final step" title={stage.title} blurb={stage.blurb}>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="lg" onClick={copy} className="h-11 rounded-full px-5">
              {copied ? <Check data-icon="inline-start" className="text-brand-green" /> : <Copy data-icon="inline-start" />}
              {copied ? "Copied" : "Copy JSON"}
            </Button>
            <Button size="lg" onClick={download} className="h-11 rounded-full bg-brand px-5 text-white hover:bg-brand-dark">
              <Download data-icon="inline-start" /> Download .json
            </Button>
          </div>
        </StageHeader>

        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
          <aside className="flex flex-col gap-3" aria-label="Summary of choices">
            <SummaryItem stageId="direction" label="Direction" value={spec.meta.direction.name} />
            <SummaryItem stageId="typography" label="Typography" value={`${t.typography.headingFont.family} / ${t.typography.bodyFont.family}`} />
            <SummaryItem stageId="color" label="Color" value={t.color.palette.name}>
              <div className="mt-1 flex h-4 overflow-hidden rounded-full ring-1 ring-black/5">
                {Object.values(t.color.roles).map((c, i) => (
                  <span key={i} className="flex-1" style={{ background: c }} />
                ))}
              </div>
            </SummaryItem>
            <SummaryItem stageId="surface" label="Surface" value={`${t.surface} · ${t.radiusScale.md}px radius`} />
            <SummaryItem stageId="components" label="Components" value={`${Object.keys(t.components).length} categories`}>
              <p className="text-xs leading-relaxed text-[#676879]">
                {Object.entries(t.components)
                  .map(([cat, v]) => `${componentCategoryById[cat].name}: ${componentCategoryById[cat].variants.find((x) => x.id === v)?.name}`)
                  .join(" · ")}
              </p>
            </SummaryItem>
            <SummaryItem stageId="layout" label="Layout" value={`${spec.composition.sections.length} sections`}>
              <ol className="text-xs leading-relaxed text-[#676879]">
                {spec.composition.sections.map((s) => (
                  <li key={s.type}>
                    {s.order + 1}. {sectionById[s.type].name}
                  </li>
                ))}
              </ol>
            </SummaryItem>
            <SummaryItem stageId="motion" label="Motion" value={t.motion.preset} />
            <button onClick={startOver} className="mt-2 inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#676879] hover:text-brand-red">
              <RotateCcw className="size-4" /> Start over
            </button>
          </aside>

          <div className="min-w-0 overflow-hidden rounded-3xl bg-[#1e1e2e] ring-1 ring-black/10">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#FF5F57]" />
                <span className="size-3 rounded-full bg-[#FEBC2E]" />
                <span className="size-3 rounded-full bg-[#28C840]" />
                <span className="ml-3 font-mono text-xs text-white/50">landinpage-spec-{spec.meta.direction.id}.json</span>
              </div>
              <span className="font-mono text-xs text-white/40">{json.split("\n").length} lines</span>
            </div>
            <pre className="max-h-[75vh] overflow-auto p-5 font-mono text-[13px] leading-relaxed text-[#d4d4d4]">
              <code>{highlighted}</code>
            </pre>
          </div>
        </div>
      </StagePage>
      <WizardNav onBack={goBack} onNext={download} nextLabel="Download .json" hint="Everything stays in your browser" />
    </>
  )
}
