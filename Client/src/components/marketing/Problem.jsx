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
      <div className="mx-auto max-w-7xl rounded-[40px] bg-brand-navy px-6 py-20 md:px-14 md:py-28">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold tracking-wide text-brand-yellow uppercase">The problem</p>
          <h2 className="mt-4 font-display text-4xl leading-tight font-bold tracking-tight text-white md:text-6xl">
            Every AI-built site looks the same.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-white/70 md:text-xl">
            The tools aren't bad. Nobody made the design decisions, so the model filled in the gaps with the average.
            LandinPage gives you back those decisions.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PAINS.map(({ icon: Icon, color, title, body }) => (
            <div key={title} className="rounded-3xl bg-white/[0.06] p-7 ring-1 ring-white/10">
              <span className={`grid size-12 place-items-center rounded-2xl ${color} text-brand-navy`}>
                <Icon className="size-6" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-white">{title}</h3>
              <p className="mt-2 leading-relaxed text-white/65">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
