// Tools the exported JSON spec can be pasted into. Swap in real customer
// logos here once you have permission to show them.
const TOOLS = ["Claude", "Cursor", "v0", "Lovable", "Bolt", "Replit", "Windsurf", "GitHub Copilot", "Webflow", "Framer"]

function Row({ hidden }) {
  return (
    <ul className="flex shrink-0 items-center gap-5 py-5 pr-5" aria-hidden={hidden || undefined}>
      {TOOLS.map((name) => (
        <li key={name} className="rounded-full bg-white px-6 py-2.5 font-display text-xl font-semibold whitespace-nowrap text-brand-navy/55 shadow-clay-sm">
          {name}
        </li>
      ))}
    </ul>
  )
}

export function LogoMarquee() {
  return (
    <section aria-label="Works with" className="pop-in-view pb-20 md:pb-24">
      <p className="px-5 text-center text-sm font-bold tracking-wide text-brand-muted uppercase">
        Paste your spec into the tools you already build with
      </p>
      <div className="group mt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max [animation:dp-marquee_40s_linear_infinite] group-hover:[animation-play-state:paused]">
          <Row />
          <Row hidden />
        </div>
      </div>
    </section>
  )
}
