import { surfaceVariants } from "@/components/brand/surface"
import { cn } from "@/lib/utils"

export function SettingsHeader({ title, description }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-4xl leading-tight font-semibold text-brand-navy">{title}</h1>
      {description && <p className="mt-2 text-lg leading-relaxed text-brand-body">{description}</p>}
    </div>
  )
}

/** A white section card. Rows inside are divided by hairlines; `footer` renders a mist action bar. */
export function SettingsCard({ title, description, action, footer, children, className }) {
  return (
    <section className={cn(surfaceVariants(), "overflow-hidden", className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-card pt-card">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold text-brand-navy">{title}</h2>
            {description && <p className="mt-1 text-sm text-brand-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="divide-y divide-border px-card">{children}</div>
      {footer && <div className="flex items-center justify-end gap-2 border-t border-border bg-brand-mist px-card py-3">{footer}</div>}
    </section>
  )
}

/** Label and description on the left, the control on the right; stacks on small screens. */
export function SettingsRow({ label, description, htmlFor, children, className }) {
  return (
    <div className={cn("grid gap-3 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-center md:gap-8", className)}>
      <div className="min-w-0">
        <label htmlFor={htmlFor} className="text-ui font-semibold text-brand-navy">
          {label}
        </label>
        {description && <p className="mt-0.5 text-sm text-brand-subtle">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
