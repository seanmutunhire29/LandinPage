import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Logo } from "./Logo"
import { brandButtonVariants } from "@/components/brand/button"
import { useAuthStore } from "@/store/useAuthStore"
import { AuthDialog } from "@/components/auth/AuthDialog"
import { UserMenu } from "@/components/auth/UserMenu"

export function Navbar() {
  const user = useAuthStore((s) => s.user)
  const ready = useAuthStore((s) => s.ready)
  const navigate = useNavigate()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 md:px-6">
      <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-4 rounded-full bg-white/90 py-2.5 pr-2.5 pl-6 shadow-clay-sm backdrop-blur md:grid-cols-[1fr_auto_1fr]">
        <Link to="/" aria-label="LandinPage home" className="justify-self-start">
          <Logo />
        </Link>
        <div className="hidden items-center gap-1 rounded-full bg-brand-fill p-1 shadow-clay-inset md:flex">
          <a href="#problem" className="rounded-full px-4 py-1.5 text-ui font-bold text-brand-ink transition-colors hover:bg-white hover:text-brand-dark">
            Why
          </a>
          <a href="#how" className="rounded-full px-4 py-1.5 text-ui font-bold text-brand-ink transition-colors hover:bg-white hover:text-brand-dark">
            How it works
          </a>
        </div>
        <nav className="flex items-center gap-2 justify-self-end md:gap-4">
          {user ? (
            <Link to="/profile" className="px-2 text-ui font-bold text-brand-ink hover:text-brand-dark">
              My projects
            </Link>
          ) : (
            ready && (
              <button onClick={() => setAuthOpen(true)} className="px-2 text-ui font-bold text-brand-ink hover:text-brand-dark">
                Log in
              </button>
            )
          )}
          <Link to="/onboarding/direction" className={brandButtonVariants({ size: "md" })}>
            Get Started
          </Link>
          {user && <UserMenu />}
        </nav>
      </div>
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialMode="login"
        redirectTo={`${window.location.origin}/auth/callback`}
        description="Log in to open your projects, or create an account to get started."
        onAuthenticated={() => {
          setAuthOpen(false)
          navigate("/profile")
        }}
      />
    </header>
  )
}
