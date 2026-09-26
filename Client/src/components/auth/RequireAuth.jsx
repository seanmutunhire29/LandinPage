import { useState } from "react"
import { Loader2, LockKeyhole } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { AppHeader } from "@/components/account/AppHeader"
import { AuthDialog } from "@/components/auth/AuthDialog"
import { BrandButton } from "@/components/brand/button"
import { surfaceVariants } from "@/components/brand/surface"
import { cn } from "@/lib/utils"

/** Gate a route on a Supabase session; signed-out users get a sign-in prompt in place. */
export function RequireAuth({ children }) {
  const ready = useAuthStore((s) => s.ready)
  const user = useAuthStore((s) => s.user)
  const [authOpen, setAuthOpen] = useState(true)

  if (!ready)
    return (
      <div className="grid h-svh place-items-center bg-brand-mist">
        <Loader2 className="size-6 animate-spin text-brand-dark" />
      </div>
    )
  if (user) return children

  return (
    <div className="min-h-svh bg-brand-mist">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-gutter py-16 md:px-gutter-md">
        <div className={cn(surfaceVariants(), "flex flex-col items-center gap-4 px-card py-16 text-center")}>
          <span className="grid size-12 place-items-center rounded-2xl bg-brand-yellow text-brand-navy">
            <LockKeyhole className="size-5" />
          </span>
          <div>
            <p className="font-display text-xl font-semibold text-brand-navy">Sign in to continue</p>
            <p className="mt-1 text-ui text-brand-muted">Your profile, projects, and settings are waiting.</p>
          </div>
          <BrandButton onClick={() => setAuthOpen(true)} size="lg">
            Sign in
          </BrandButton>
        </div>
      </main>
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialMode="login"
        redirectTo={`${window.location.origin}/auth/callback`}
        onAuthenticated={() => setAuthOpen(false)}
      />
    </div>
  )
}
