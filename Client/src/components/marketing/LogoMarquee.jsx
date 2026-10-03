import { Badge } from "@/components/ui/badge"

// Tools the exported JSON spec can be pasted into. Swap in real customer
// logos here once you have permission to show them.
const TOOLS = ["Claude", "Cursor", "v0", "Lovable", "Bolt", "Replit", "Windsurf", "GitHub Copilot", "Webflow", "Framer"]

/** Static row of the tools the spec works with. */
export function LogoMarquee() {
  return (
    <section aria-label="Works with" className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <p className="text-center text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Paste your spec into the tools you already build with
        </p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {TOOLS.map((name) => (
            <li key={name}>
              <Badge variant="outline" className="h-7 px-3 text-sm text-muted-foreground">
                {name}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
