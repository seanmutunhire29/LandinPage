import { Link } from "react-router-dom"
import { Logo } from "@/components/marketing/Logo"
import { UserMenu } from "@/components/auth/UserMenu"
import { cn } from "@/lib/utils"

/** Top bar for the account pages: wordmark on the left, account menu on the right. */
export function AppHeader({ className }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 shadow-[0_12px_30px_-20px_rgb(59_7_100/0.4)] backdrop-blur">
      <div className={cn("mx-auto flex max-w-5xl items-center justify-between px-gutter py-3 md:px-gutter-md", className)}>
        <Link to="/" aria-label="LandinPage home">
          <Logo />
        </Link>
        <UserMenu />
      </div>
    </header>
  )
}
