import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WizardNav({ onBack, onNext, nextDisabled, nextLabel = "Next", backLabel = "Back", hint }) {
  return (
    <div className="sticky bottom-0 z-30 mt-12 bg-white/90 shadow-[0_-12px_30px_-20px_rgb(59_7_100/0.4)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Button variant="outline" size="lg" onClick={onBack} className="h-11 rounded-full border-0 bg-white px-5 text-[15px] font-bold text-brand-navy shadow-clay-sm ring-2 ring-brand/50 ring-inset transition-transform duration-200 ease-spring hover:scale-[1.03] hover:bg-white active:scale-95">
          <ArrowLeft data-icon="inline-start" /> {backLabel}
        </Button>
        {hint && <p className="hidden text-sm text-brand-muted sm:block">{hint}</p>}
        <Button
          size="lg"
          onClick={onNext}
          disabled={nextDisabled}
          className="h-11 rounded-full bg-brand px-6 text-[15px] font-bold text-brand-navy shadow-brand-sm transition-transform duration-200 ease-spring hover:scale-[1.03] hover:bg-brand active:scale-95"
        >
          {nextLabel} <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}
