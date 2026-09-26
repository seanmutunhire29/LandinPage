import { GetStartedButton } from "./GetStartedButton"

export function CtaBand() {
  return (
    <section className="px-3 pb-6 md:px-6">
      <div className="relative mx-auto max-w-7xl overflow-hidden pop-in-view rounded-block bg-brand-blue px-6 py-20 text-center shadow-clay md:px-14 md:py-24">
        <div className="absolute -top-10 -left-10 size-40 rounded-full bg-brand-green shadow-clay" aria-hidden />
        <div className="absolute -right-8 -bottom-12 size-48 rounded-block bg-brand shadow-brand" aria-hidden />
        <div className="relative">
          <h2 className="mx-auto max-w-3xl font-display text-4xl leading-tight font-semibold text-brand-navy md:text-heading">
            Make the decisions. Skip the sameness.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-brand-navy/75">
            Start with a direction. You'll have a complete design spec in a few minutes.
          </p>
          <GetStartedButton variant="navy" className="mt-10" />
        </div>
      </div>
    </section>
  )
}
