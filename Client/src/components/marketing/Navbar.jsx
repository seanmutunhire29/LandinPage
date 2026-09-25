import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Logo } from "./Logo"
import { useAuthStore } from "@/store/useAuthStore"
import { AuthDialog } from "@/components/auth/AuthDialog"
import { UserMenu } from "@/components/auth/UserMenu"

export function Navbar() {
  const user = useAuthStore((s) => s.user)
  const ready = useAuthStore((s) => s.ready)
  const navigate = useNavigate()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link to="/" aria-label="LandInPage home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2 md:gap-6">
          <a href="#problem" className="hidden text-[15px] font-medium text-[#323338] hover:text-brand md:block">
            Why
          </a>
          <a href="#how" className="hidden text-[15px] font-medium text-[#323338] hover:text-brand md:block">
            How it works
          </a>
          {user ? (
            <Link to="/projects" className="px-2 text-[15px] font-medium text-[#323338] hover:text-brand">
              My projects
            </Link>
          ) : (
            ready && (
              <button onClick={() => setAuthOpen(true)} className="px-2 text-[15px] font-medium text-[#323338] hover:text-brand">
                Log in
              </button>
            )
          )}
          <Link
            to="/onboarding/direction"
            className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-[15px] font-semibold text-white hover:bg-brand-dark"
          >
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
          navigate("/projects")
        }}
      />
    </header>
  )
}
