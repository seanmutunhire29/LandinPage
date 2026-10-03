import { Link, Navigate, Outlet, useLocation } from "react-router-dom"
import { X } from "lucide-react"
import { STAGES } from "@/data/stages"
import { useDesignStore } from "@/store/useDesignStore"
import { canVisit, firstIncompleteIndex } from "@/lib/progress"
import { ProgressIndicator } from "./ProgressIndicator"
import { Logo } from "@/components/marketing/Logo"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { TooltipProvider } from "@/components/ui/tooltip"

export function WizardLayout() {
  const { pathname } = useLocation()
  const state = useDesignStore()
  const index = STAGES.findIndex((s) => pathname.startsWith(s.path))

  if (index === -1) return <Navigate to={STAGES[0].path} replace />
  // Guard: a stage is only reachable once every stage before it is complete.
  if (!canVisit(index, state)) return <Navigate to={STAGES[firstIncompleteIndex(state)].path} replace />

  return (
    <TooltipProvider>
      <div className="min-h-svh bg-background">
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
          {/* Below sm the progress bar drops to its own row so nothing overflows. */}
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 md:gap-x-6 md:px-6">
            <Link to="/" className="shrink-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50" aria-label="LandinPage home">
              <Logo size="sm" />
            </Link>
            <div className="order-last min-w-0 basis-full sm:order-none sm:flex-1 sm:basis-auto">
              <ProgressIndicator currentIndex={index} />
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-1 sm:ml-0">
              <ModeToggle />
              <Button variant="ghost" size="icon" asChild>
                <Link to="/" aria-label="Exit onboarding">
                  <X />
                </Link>
              </Button>
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </TooltipProvider>
  )
}

/** Main content column for stage pages. */
export function StagePage({ children }) {
  return <main className="mx-auto max-w-6xl px-4 pt-10 md:px-6 md:pt-12">{children}</main>
}
