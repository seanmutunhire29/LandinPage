import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function WizardNav({ onBack, onNext, nextDisabled, nextLabel = "Next", backLabel = "Back", hint }) {
  return (
    <div className="sticky bottom-0 z-30 mt-12 border-t border-[#e3e5f0] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Button variant="outline" size="lg" onClick={onBack} className="h-11 rounded-full px-5 text-[15px]">
          <ArrowLeft data-icon="inline-start" /> {backLabel}
        </Button>
        {hint && <p className="hidden text-sm text-[#676879] sm:block">{hint}</p>}
        <Button
          size="lg"
          onClick={onNext}
          disabled={nextDisabled}
          className="h-11 rounded-full bg-brand px-6 text-[15px] text-white hover:bg-brand-dark"
        >
          {nextLabel} <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}
