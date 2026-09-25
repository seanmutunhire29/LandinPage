import { Link, Navigate, Outlet, useLocation } from "react-router-dom"
import { X } from "lucide-react"
import { STAGES } from "@/data/stages"
import { useDesignStore } from "@/store/useDesignStore"
import { canVisit, firstIncompleteIndex } from "@/lib/progress"
import { ProgressIndicator } from "./ProgressIndicator"
import { Logo } from "@/components/marketing/Logo"
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
      <div className="min-h-svh bg-brand-mist">
        <header className="sticky top-0 z-40 border-b border-[#e3e5f0] bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3 md:px-8">
            <Link to="/" className="shrink-0" aria-label="DesignPath home">
              <Logo />
            </Link>
            <div className="min-w-0 flex-1">
              <ProgressIndicator currentIndex={index} />
            </div>
            <Link
              to="/"
              className="grid size-9 shrink-0 place-items-center rounded-full text-[#676879] hover:bg-[#f1f2f8] hover:text-brand-navy"
              aria-label="Exit onboarding"
            >
              <X className="size-5" />
            </Link>
          </div>
        </header>
        <Outlet />
      </div>
    </TooltipProvider>
  )
}

/** Main content column for stage pages. */
export function StagePage({ children }) {
  return <main className="mx-auto max-w-6xl px-5 pt-10 md:px-8 md:pt-12">{children}</main>
}
