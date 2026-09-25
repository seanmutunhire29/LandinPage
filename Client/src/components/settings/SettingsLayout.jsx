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
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 md:grid-cols-[220px_minmax(0,1fr)] md:gap-10 md:px-8 md:py-10">
        <aside className="md:sticky md:top-8 md:self-start">
          <NavLink
            to="/projects"
            className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#676879] transition-colors hover:text-brand-navy"
          >
            <ArrowLeft className="size-3.5" /> Back to projects
          </NavLink>
          <p className="mb-2 hidden px-3 text-[11px] font-semibold tracking-wider text-[#9699a6] uppercase md:block">Settings</p>
          <nav aria-label="Settings" className="-mx-1 flex gap-1 overflow-x-auto px-1 md:flex-col md:overflow-visible">
            {SECTIONS.map(({ id, label, Icon }) => (
              <NavLink
                key={id}
                to={`/settings/${id}`}
                className={({ isActive }) =>
                  cn(
                    "relative flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "bg-white text-brand-navy shadow-[0_1px_2px_rgb(24_27_52/0.06)] ring-1 ring-[#e3e5f0] md:before:absolute md:before:inset-y-2 md:before:left-0 md:before:w-0.5 md:before:rounded-full md:before:bg-brand"
                      : "text-[#676879] hover:bg-white/70 hover:text-brand-navy"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn("size-4", isActive ? "text-brand" : "text-[#9699a6]")} />
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
