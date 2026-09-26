import { Blend, CaseSensitive, SquareStack } from "lucide-react"

const PAINS = [
  {
    icon: Blend,
    color: "bg-brand-red",
    title: "The same purple gradient hero",
    body: "When you don't decide on a direction, the model falls back to the most common one it has seen.",
  },
  {
    icon: CaseSensitive,
    color: "bg-brand-yellow",
    title: "The same font on every site",
    body: "Type is the fastest way to give a page a voice, and most AI-built sites just use the default.",
  },
  {
    icon: SquareStack,
    color: "bg-brand-green",
    title: "Rounded cards, soft shadows, repeat",
    body: "Every component comes out a little generic, because no one decided what it should be.",
  },
]

export function Problem() {
  return (
    <section id="problem" className="px-3 md:px-6">
      <div className="pop-in-view mx-auto max-w-7xl rounded-block bg-brand px-6 py-20 shadow-brand md:px-14 md:py-28">
        <div className="max-w-3xl">
          <p className="inline-block rounded-full px-3.5 py-1 text-sm font-bold tracking-wide text-brand-navy uppercase ring-2 ring-brand-navy/40">The problem</p>
          <h2 className="mt-5 font-display text-4xl leading-tight font-semibold text-brand-navy md:text-heading">
            Every AI-built site looks the same.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-brand-navy/80 md:text-[21px]">
            The tools aren't bad. Nobody made the design decisions, so the model filled in the gaps with the average.
            LandinPage gives you back those decisions.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PAINS.map(({ icon: Icon, color, title, body }) => (
            <div key={title} className="rounded-[39px] bg-white p-8 shadow-clay transition-transform duration-200 ease-spring hover:scale-[1.03]">
              <span className={`grid size-14 place-items-center rounded-[20px] ${color} text-brand-navy shadow-clay-sm`}>
                <Icon className="size-6" />
              </span>
              <h3 className="mt-6 font-display text-[21px] font-semibold text-brand-navy">{title}</h3>
              <p className="mt-2 leading-relaxed text-brand-muted">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
