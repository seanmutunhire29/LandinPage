import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Sticky bottom bar with Back / Next for a stage. */
export function WizardNav({ onBack, onNext, nextDisabled, nextLabel = "Next", backLabel = "Back", hint }) {
  return (
    <div className="sticky bottom-0 z-30 mt-12 border-t bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-6">
        <Button variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft data-icon="inline-start" /> {backLabel}
        </Button>
        {hint && <p className="hidden text-sm text-muted-foreground sm:block">{hint}</p>}
        <Button size="lg" onClick={onNext} disabled={nextDisabled} className="min-w-0">
          <span className="truncate">{nextLabel}</span> <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </div>
  )
}
