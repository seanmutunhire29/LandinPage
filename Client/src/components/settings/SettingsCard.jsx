import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function SettingsHeader({ title, description }) {
  return (
    <div className="mb-6 md:mb-8">
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
      {description && <p className="mt-1.5 text-muted-foreground">{description}</p>}
    </div>
  )
}

/** A section card. Rows inside are divided by hairlines; `footer` renders a muted action bar. */
export function SettingsCard({ title, description, action, footer, children, className }) {
  return (
    <Card className={cn("gap-0 py-0", className)}>
      {(title || action) && (
        <CardHeader className="pt-5">
          {title && <CardTitle className="text-lg font-semibold">{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
          {action && <CardAction>{action}</CardAction>}
        </CardHeader>
      )}
      <CardContent className="divide-y">{children}</CardContent>
      {footer && <CardFooter className="flex-wrap justify-end gap-2 border-t">{footer}</CardFooter>}
    </Card>
  )
}

/** Label and description on the left, the control on the right; stacks on small screens. */
export function SettingsRow({ label, description, htmlFor, children, className }) {
  return (
    <div className={cn("grid gap-3 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] md:items-center md:gap-8", className)}>
      <div className="min-w-0">
        <Label htmlFor={htmlFor}>{label}</Label>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
