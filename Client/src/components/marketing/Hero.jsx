import { useEffect } from "react"
import { GetStartedButton } from "./GetStartedButton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { loadFont } from "@/lib/fonts"

// Illustration content: these depict choices a user makes in the wizard, so they keep their own colors.
const MOCK_CHIPS = [
  { label: "Button", bg: "#FF90E8" },
  { label: "Tag", bg: "#FFC900" },
]
const MOCK_PALETTE = ["#2E3440", "#5E81AC", "#88C0D0", "#A3BE8C", "#ECEFF4"]

function StageLabel({ children }) {
  return <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{children}</p>
}

/** Static composition of mock "decision cards", one per early wizard stage. */
function DecisionCollage() {
  useEffect(() => loadFont("Fraunces"), [])
  return (
    <div className="mx-auto grid w-full max-w-md gap-4 sm:grid-cols-2">
      <Card className="sm:col-span-2">
        <CardHeader>
          <StageLabel>Stage 0 · Direction</StageLabel>
          <p className="text-lg font-semibold tracking-tight">Neo-Brutalist Pastel</p>
        </CardHeader>
        <CardContent className="flex gap-2">
          {MOCK_CHIPS.map(({ label, bg }) => (
            <span key={label} className="rounded-md border px-3 py-1 text-xs font-semibold" style={{ background: bg, color: "#0A0A0A" }}>
              {label}
            </span>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <StageLabel>Stage 1 · Type</StageLabel>
        </CardHeader>
        <CardContent>
          <p className="text-5xl leading-none font-semibold" style={{ fontFamily: '"Fraunces", serif' }}>
            Aa
          </p>
          <p className="mt-2 text-sm text-muted-foreground">Fraunces / Inter</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <StageLabel>Stage 2 · Color</StageLabel>
        </CardHeader>
        <CardContent>
          <div className="flex overflow-hidden rounded-md border">
            {MOCK_PALETTE.map((c) => (
              <span key={c} className="h-8 flex-1" style={{ background: c }} />
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">Nord Snow Storm</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function Hero() {
  return (
    <section>
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl lg:text-6xl">
            Decide how your landing page looks. <span className="text-muted-foreground">Step by step.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Answer a guided sequence of visual choices and walk away with a build-ready JSON spec for your landing page.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <GetStartedButton />
            <Button asChild variant="outline" size="lg">
              <a href="#how">See how it works</a>
            </Button>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">7 stages · about 5 minutes · no account needed</p>
        </div>
        <DecisionCollage />
      </div>
    </section>
  )
}
