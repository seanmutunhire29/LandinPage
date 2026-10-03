import { GetStartedButton } from "./GetStartedButton"

/** Closing call to action above the footer. */
export function CtaBand() {
  return (
    <section className="border-t">
      <div className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-24">
        <h2 className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl">Make the decisions. Skip the sameness.</h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
          Start with a direction. You'll have a complete design spec in a few minutes.
        </p>
        <GetStartedButton className="mt-8" />
      </div>
    </section>
  )
}
