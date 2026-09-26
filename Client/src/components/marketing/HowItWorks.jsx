import { FileJson } from "lucide-react"
import { STAGES } from "@/data/stages"

const TILE_COLORS = [
  "bg-brand",
  "bg-brand-blue",
  "bg-brand-green",
  "bg-brand-yellow",
  "bg-brand-red",
  "bg-white",
  "bg-brand/60",
]

export function HowItWorks() {
  const stages = STAGES.filter((s) => s.id !== "review")
  return (
    <section id="how" className="pop-in-view mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="max-w-3xl">
        <p className="inline-block rounded-full px-3.5 py-1 text-sm font-bold tracking-wide text-brand-dark uppercase ring-2 ring-brand/50">How it works</p>
        <h2 className="mt-5 font-display text-4xl leading-tight font-semibold text-brand-navy md:text-heading">
          Seven decisions. One spec.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-brand-body md:text-[21px]">
          Each stage shows only the options that fit the choices you've already made, so the result always holds
          together.
        </p>
      </div>
      <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((s, i) => (
          <li key={s.id} className={`flex min-h-44 flex-col justify-between rounded-[39px] p-7 text-brand-navy shadow-clay transition-transform duration-200 ease-spring hover:scale-[1.03] ${TILE_COLORS[i]}`}>
            <span className="font-display text-5xl font-semibold opacity-80">{String(i).padStart(2, "0")}</span>
            <div>
              <h3 className="font-display text-[21px] font-semibold">{s.label}</h3>
              <p className="mt-1 text-ui leading-snug opacity-80">{s.tagline}</p>
            </div>
          </li>
        ))}
        <li className="flex min-h-44 flex-col justify-between rounded-[39px] border-[3px] border-dashed border-brand/60 bg-brand-fill p-7 shadow-clay-inset">
          <FileJson className="size-10 text-brand-dark" />
          <div>
            <h3 className="font-display text-[21px] font-semibold text-brand-navy">Your build spec</h3>
            <p className="mt-1 text-ui leading-snug text-brand-muted">Tokens, composition and content as JSON.</p>
          </div>
        </li>
      </ol>
    </section>
  )
}
