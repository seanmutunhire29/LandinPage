import { NavLink } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { AppHeader } from "@/components/account/AppHeader"
import { cn } from "@/lib/utils"
import { SECTIONS } from "./sections"


/** Settings shell: section sidebar on the left, the active section on the right. */
export function SettingsLayout({ children }) {
  return (
    <div className="min-h-svh bg-brand-mist">
      <AppHeader className="max-w-6xl" />
      <div className="mx-auto grid max-w-6xl gap-6 px-gutter py-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10 md:px-gutter-md md:py-14">
        <aside className="md:sticky md:top-24 md:self-start">
          <NavLink
            to="/profile"
            className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-muted transition-colors hover:text-brand-navy"
          >
            <ArrowLeft className="size-3.5" /> Back to profile
          </NavLink>
          <p className="eyebrow-xs mb-2 hidden px-4 text-brand-subtle md:block">Settings</p>
          <nav aria-label="Settings" className="-mx-1 flex gap-1 overflow-x-auto px-1 md:flex-col md:overflow-visible">
            {SECTIONS.map(({ id, label, Icon }) => (
              <NavLink
                key={id}
                to={`/settings/${id}`}
                className={({ isActive }) =>
                  cn(
                    "flex h-10 shrink-0 items-center gap-2.5 rounded-full px-4 text-ui font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-4 focus-visible:ring-brand/30",
                    isActive ? "bg-brand text-brand-navy shadow-brand-sm" : "text-brand-muted hover:bg-white hover:text-brand-navy"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn("size-4", isActive ? "text-brand-navy" : "text-brand-subtle")} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
