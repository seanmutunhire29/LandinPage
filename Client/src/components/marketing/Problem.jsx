import { Blend, CaseSensitive, SquareStack } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const PAINS = [
  {
    icon: Blend,
    title: "The same purple gradient hero",
    body: "When you don't decide on a direction, the model falls back to the most common one it has seen.",
  },
  {
    icon: CaseSensitive,
    title: "The same font on every site",
    body: "Type is the fastest way to give a page a voice, and most AI-built sites just use the default.",
  },
  {
    icon: SquareStack,
    title: "Rounded cards, soft shadows, repeat",
    body: "Every component comes out a little generic, because no one decided what it should be.",
  },
]

/** "Why" section: the generic-AI-site problem, with three pain points. */
export function Problem() {
  return (
    <section id="problem" className="scroll-mt-16 border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="max-w-3xl">
          <Badge variant="outline">The problem</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Every AI-built site looks the same.</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">
            The tools aren't bad. Nobody made the design decisions, so the model filled in the gaps with the average.
            LandinPage gives you back those decisions.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PAINS.map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <CardHeader>
                <span className="mb-2 grid size-9 place-items-center rounded-md bg-muted text-muted-foreground">
                  <Icon className="size-4" />
                </span>
                <CardTitle>
                  <h3>{title}</h3>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="leading-relaxed">{body}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
