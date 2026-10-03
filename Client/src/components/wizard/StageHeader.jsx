import { Badge } from "@/components/ui/badge"

/** Stage title block: outline badge eyebrow, page title, description, optional actions. */
export function StageHeader({ eyebrow, title, blurb, children }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && (
          <Badge variant="outline" className="mb-3 text-muted-foreground">
            {eyebrow}
          </Badge>
        )}
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        <p className="mt-2 text-muted-foreground">{blurb}</p>
      </div>
      {children}
    </div>
  )
}
