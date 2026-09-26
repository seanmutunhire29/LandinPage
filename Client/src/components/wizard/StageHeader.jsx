export function StageHeader({ eyebrow, title, blurb, children }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-3 inline-block rounded-full px-3 py-0.5 text-sm font-bold tracking-wide text-brand-dark uppercase ring-2 ring-brand/50">{eyebrow}</p>}
        <h1 className="font-display text-3xl font-semibold text-brand-navy md:text-[38px] md:leading-tight">{title}</h1>
        <p className="mt-2 text-base text-brand-muted md:text-lg">{blurb}</p>
      </div>
      {children}
    </div>
  )
}
