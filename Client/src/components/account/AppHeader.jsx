import { Link } from "react-router-dom"
import { Logo } from "@/components/marketing/Logo"
import { UserMenu } from "@/components/auth/UserMenu"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"

/** Top bar for the account pages: wordmark on the left, theme toggle and account menu on the right. */
export function AppHeader({ className }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className={cn("mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 md:px-6", className)}>
        <Link to="/" aria-label="LandinPage home" className="shrink-0">
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  )
}
