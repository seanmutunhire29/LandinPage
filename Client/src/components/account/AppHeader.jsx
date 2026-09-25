import { Link } from "react-router-dom"
import { Logo } from "@/components/marketing/Logo"
import { UserMenu } from "@/components/auth/UserMenu"
import { cn } from "@/lib/utils"

/** Top bar for the account pages: wordmark on the left, account menu on the right. */
export function AppHeader({ className }) {
  return (
    <header className="border-b border-[#e3e5f0] bg-white">
      <div className={cn("mx-auto flex max-w-5xl items-center justify-between px-5 py-3 md:px-8", className)}>
        <Link to="/" aria-label="LandinPage home">
          <Logo />
        </Link>
        <UserMenu />
      </div>
    </header>
  )
}
