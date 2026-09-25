import { FileJson } from "lucide-react"
import { STAGES } from "@/data/stages"

const TILE_COLORS = [
  "bg-brand text-white",
  "bg-brand-red text-white",
  "bg-brand-yellow text-brand-navy",
  "bg-brand-green text-brand-navy",
  "bg-brand-blue text-white",
  "bg-[#FF7575] text-white",
  "bg-[#A25DDC] text-white",
]

export function HowItWorks() {
  const stages = STAGES.filter((s) => s.id !== "review")
  return (
    <section id="how" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold tracking-wide text-brand uppercase">How it works</p>
        <h2 className="mt-4 font-display text-4xl leading-tight font-bold tracking-tight text-brand-navy md:text-6xl">
          Seven decisions. One spec.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-[#4b4d61] md:text-xl">
          Each stage shows only the options that fit the choices you've already made, so the result always holds
          together.
        </p>
      </div>
      <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stages.map((s, i) => (
          <li key={s.id} className={`flex min-h-44 flex-col justify-between rounded-3xl p-6 ${TILE_COLORS[i]}`}>
            <span className="font-display text-5xl font-extrabold opacity-90">{String(i).padStart(2, "0")}</span>
            <div>
              <h3 className="font-display text-xl font-bold">{s.label}</h3>
              <p className="mt-1 text-[15px] leading-snug opacity-85">{s.tagline}</p>
            </div>
          </li>
        ))}
        <li className="flex min-h-44 flex-col justify-between rounded-3xl border-2 border-dashed border-brand-navy/20 bg-white p-6">
          <FileJson className="size-10 text-brand" />
          <div>
            <h3 className="font-display text-xl font-bold text-brand-navy">Your build spec</h3>
            <p className="mt-1 text-[15px] leading-snug text-[#676879]">Tokens, composition and content as JSON.</p>
          </div>
        </li>
      </ol>
    </section>
  )
}
