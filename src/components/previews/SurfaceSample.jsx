import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/** A live shadcn Card + Button rendered in one surface material. */
export function SurfaceSample({ theme }) {
  const { colors, cardStyle, controlStyle, cardClass, surface, gradient, headingStyle } = theme
  return (
    <div className="grid h-52 place-items-center p-6" style={{ background: surface.backdrop ? gradient : colors.background }}>
      <Card className={cn("w-full max-w-64 gap-3 py-4 ring-0", cardClass)} style={cardStyle}>
        <CardHeader>
          <CardTitle style={headingStyle}>Team plan</CardTitle>
          <CardDescription>Everything you need to launch, for up to 10 people.</CardDescription>
        </CardHeader>
        <CardFooter className="border-0 bg-transparent pt-1">
          <Button style={controlStyle}>
            Choose plan <ArrowRight data-icon="inline-end" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
