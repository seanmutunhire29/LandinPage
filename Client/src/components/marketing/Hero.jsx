import { useEffect } from "react"
import { GetStartedButton } from "./GetStartedButton"
import { loadFont } from "@/lib/fonts"

function Swatch({ color }) {
  return <span className="h-8 flex-1 first:rounded-l-2xl last:rounded-r-2xl" style={{ background: color }} />
}

/** Playful stack of mock "decision cards" floating over color blocks. */
function DecisionCollage() {
  useEffect(() => loadFont("Fraunces"), [])
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      <div className="absolute top-[6%] right-0 h-[62%] w-[72%] rounded-block bg-brand shadow-brand" />
      <div className="absolute bottom-0 left-0 h-[46%] w-[58%] rounded-block bg-brand-blue shadow-clay" />
      <div className="absolute right-[8%] bottom-[8%] size-24 rounded-full bg-brand-green shadow-clay" />
      <div className="absolute top-0 left-[10%] size-16 rounded-full bg-brand-yellow shadow-clay" />

      <div
        className="absolute top-[12%] left-[4%] w-[58%] rounded-[39px] bg-white p-6 shadow-float [animation:dp-float_6s_ease-in-out_infinite]"
        style={{ "--dp-rot": "-4deg" }}
      >
        <p className="text-xs font-bold tracking-wide text-brand-muted uppercase">Stage 0 · Direction</p>
        <p className="mt-1 font-display text-xl font-semibold text-brand-navy">Neo-Brutalist Pastel</p>
        <div className="mt-3 flex gap-2">
          <span className="rounded-md border-2 border-black bg-[#FF90E8] px-3 py-1 text-xs font-bold">Button</span>
          <span className="rounded-md border-2 border-black bg-[#FFC900] px-3 py-1 text-xs font-bold">Tag</span>
        </div>
      </div>

      <div
        className="absolute top-[34%] right-[2%] w-[50%] rounded-[39px] bg-white p-6 shadow-float [animation:dp-float_7s_ease-in-out_infinite_0.6s]"
        style={{ "--dp-rot": "3deg" }}
      >
        <p className="text-xs font-bold tracking-wide text-brand-muted uppercase">Stage 1 · Type</p>
        <p className="mt-1 text-5xl leading-none font-semibold text-brand-navy" style={{ fontFamily: '"Fraunces", serif' }}>
          Aa
        </p>
        <p className="mt-2 text-sm text-brand-muted">Fraunces / Inter</p>
      </div>

      <div
        className="absolute bottom-[14%] left-[10%] w-[56%] rounded-[39px] bg-white p-6 shadow-float [animation:dp-float_8s_ease-in-out_infinite_1.2s]"
        style={{ "--dp-rot": "-2deg" }}
      >
        <p className="text-xs font-bold tracking-wide text-brand-muted uppercase">Stage 2 · Color</p>
        <div className="mt-3 flex">
          {["#2E3440", "#5E81AC", "#88C0D0", "#A3BE8C", "#ECEFF4"].map((c) => (
            <Swatch key={c} color={c} />
          ))}
        </div>
        <p className="mt-2 text-sm text-brand-muted">Nord Snow Storm</p>
      </div>
    </div>
  )
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-10 pb-20 md:px-8 md:pt-16 lg:grid-cols-[1.1fr_1fr] lg:pb-28">
        <div className="animate-pop-in">
          <h1 className="mt-6 font-display text-5xl leading-[1.04] font-semibold text-brand-navy sm:text-6xl lg:text-display">
            Decide how your landing page looks.{" "}
            <span className="relative whitespace-nowrap text-brand-dark">
              Step by step.
              <svg viewBox="0 0 300 16" className="absolute -bottom-2 left-0 w-full" aria-hidden preserveAspectRatio="none">
                <path d="M2 12 C 80 2, 220 2, 298 10" stroke="#86EFAC" strokeWidth="7" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>
          <p className="mt-8 max-w-xl text-[21px] leading-relaxed text-brand-body">
            Answer a guided sequence of visual choices and walk away with a build-ready JSON spec for your landing page.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <GetStartedButton />
            <a href="#how" className="rounded-full px-4 py-2 text-lg font-bold text-brand-navy transition-[transform,background-color] duration-200 ease-spring hover:scale-[1.03] hover:bg-white hover:shadow-clay-sm active:scale-95">
              See how it works
            </a>
          </div>
          <p className="mt-6 text-sm text-brand-muted">7 stages · about 5 minutes · no account needed</p>
        </div>
        <div className="animate-pop-in [animation-delay:150ms]">
          <DecisionCollage />
        </div>
      </div>
    </section>
  )
}
