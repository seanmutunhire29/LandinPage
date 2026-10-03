import { FileJson } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { STAGES } from "@/data/stages"

/** The seven wizard stages, plus the spec they compile into. */
export function HowItWorks() {
  const stages = STAGES.filter((s) => s.id !== "review")
  return (
    <section id="how" className="scroll-mt-16 border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="max-w-3xl">
          <Badge variant="outline">How it works</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Seven decisions. One spec.</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            Each stage shows only the options that fit the choices you've already made, so the result always holds
            together.
          </p>
        </div>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((s, i) => (
            <li key={s.id}>
              <Card className="h-full">
                <CardHeader>
                  <span className="mb-2 font-mono text-sm text-muted-foreground">{String(i).padStart(2, "0")}</span>
                  <CardTitle>
                    <h3>{s.label}</h3>
                  </CardTitle>
                  <CardDescription className="leading-snug">{s.tagline}</CardDescription>
                </CardHeader>
              </Card>
            </li>
          ))}
          <li>
            <Card className="h-full bg-muted/50">
              <CardHeader>
                <span className="mb-2 grid size-9 place-items-center rounded-md bg-background text-muted-foreground ring-1 ring-border">
                  <FileJson className="size-4" />
                </span>
                <CardTitle>
                  <h3>Your build spec</h3>
                </CardTitle>
                <CardDescription className="leading-snug">Tokens, composition and content as JSON.</CardDescription>
              </CardHeader>
            </Card>
          </li>
        </ol>
      </div>
    </section>
  )
}
