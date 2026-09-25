import { Link } from "react-router-dom"
import { Logo } from "./Logo"

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
        <Link to="/" aria-label="DesignPath home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2 md:gap-6">
          <a href="#problem" className="hidden text-[15px] font-medium text-[#323338] hover:text-brand md:block">
            Why
          </a>
          <a href="#how" className="hidden text-[15px] font-medium text-[#323338] hover:text-brand md:block">
            How it works
          </a>
          <Link
            to="/onboarding/direction"
            className="inline-flex h-10 items-center rounded-full bg-brand px-5 text-[15px] font-semibold text-white hover:bg-brand-dark"
          >
            Get Started
          </Link>
        </nav>
      </div>
    </header>
  )
}
