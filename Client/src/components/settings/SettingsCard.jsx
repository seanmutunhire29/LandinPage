import { cn } from "@/lib/utils"

export function SettingsHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold tracking-tight text-brand-navy">{title}</h1>
      {description && <p className="mt-1 text-[15px] text-[#676879]">{description}</p>}
    </div>
  )
}

/** A white section card. Rows inside are divided by hairlines; `footer` renders a grey action bar. */
export function SettingsCard({ title, description, action, footer, children, className }) {
  return (
    <section className={cn("overflow-hidden rounded-2xl bg-white ring-1 ring-[#e3e5f0]", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-5 pt-5 md:px-6">
          <div className="min-w-0">
            <h2 className="font-display text-base font-semibold text-brand-navy">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-[#676879]">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="divide-y divide-[#eef0f5] px-5 md:px-6">{children}</div>
      {footer && <div className="flex items-center justify-end gap-2 border-t border-[#e3e5f0] bg-[#fafbfd] px-5 py-3 md:px-6">{footer}</div>}
    </section>
  )
}

/** Label and description on the left, the control on the right; stacks on small screens. */
export function SettingsRow({ label, description, htmlFor, children, className }) {
  return (
    <div className={cn("grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-center md:gap-8", className)}>
      <div className="min-w-0">
        <label htmlFor={htmlFor} className="text-sm font-medium text-brand-navy">
          {label}
        </label>
        {description && <p className="mt-0.5 text-[13px] text-[#9699a6]">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export const fieldClass = "h-9 rounded-lg border-[#d7d9e6] bg-white text-sm text-brand-navy shadow-[0_1px_1px_rgb(24_27_52/0.03)]"
