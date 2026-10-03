import { NavLink } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { AppHeader } from "@/components/account/AppHeader"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { SECTIONS } from "./sections"

/** Settings shell: section sidebar on the left (a wrapping row on mobile), the active section on the right. */
export function SettingsLayout({ children }) {
  return (
    <div className="min-h-svh bg-background">
      <AppHeader className="max-w-6xl" />
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10 md:px-6 md:py-12">
        <aside className="min-w-0 md:sticky md:top-20 md:self-start">
          <NavLink
            to="/profile"
            className="mb-6 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ArrowLeft className="size-3.5" /> Back to profile
          </NavLink>
          <p className="mb-2 hidden px-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase md:block">Settings</p>
          <nav aria-label="Settings" className="flex flex-wrap gap-1 md:flex-col">
            {SECTIONS.map(({ id, label, Icon }) => (
              <NavLink
                key={id}
                to={`/settings/${id}`}
                className={({ isActive }) => cn(buttonVariants({ variant: isActive ? "secondary" : "ghost" }), "justify-start md:w-full")}
              >
                <Icon />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
