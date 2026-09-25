export function StageHeader({ eyebrow, title, blurb, children }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-sm font-semibold tracking-wide text-brand uppercase">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-bold tracking-tight text-brand-navy md:text-4xl">{title}</h1>
        <p className="mt-2 text-base text-[#676879] md:text-lg">{blurb}</p>
      </div>
      {children}
    </div>
  )
}
