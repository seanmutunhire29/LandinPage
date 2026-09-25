import { Image as ImageIcon, Play, Plus, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { onColor } from "@/lib/color"
import { useScopedTheme } from "@/components/wizard/ThemeScope"

// Renders the layout trees from data/sections.js as small live wireframes,
// colored by the user's palette through the scoped CSS variables.

const bar = "rounded-full"

const LEAVES = {
  X: () => <div className={cn(bar, "h-4 w-full bg-foreground/85")} />,
  H: () => <div className={cn(bar, "h-2.5 w-4/5 bg-foreground/80")} />,
  h: () => <div className={cn(bar, "h-2 w-3/5 bg-foreground/70")} />,
  p: () => <div className={cn(bar, "h-1 w-full bg-foreground/20")} />,
  ps: () => <div className={cn(bar, "h-1 w-1/2 bg-foreground/30")} />,
  btn: () => <div className="h-3 w-10 shrink-0 rounded-[min(var(--radius),6px)] bg-primary" />,
  btn2: () => (
    <div className="flex gap-1">
      <div className="h-3 w-10 rounded-[min(var(--radius),6px)] bg-primary" />
      <div className="h-3 w-10 rounded-[min(var(--radius),6px)] border border-foreground/40" />
    </div>
  ),
  img: () => (
    <div className="grid min-h-12 w-full flex-1 place-items-center rounded-[min(var(--radius),4px)] bg-foreground/10">
      <ImageIcon className="size-3 text-foreground/30" />
    </div>
  ),
  imgR: () => (
    <div className="grid min-h-12 w-full flex-1 place-items-center rounded-xl bg-foreground/10">
      <ImageIcon className="size-3 text-foreground/30" />
    </div>
  ),
  imgT: () => (
    <div className="grid min-h-20 w-full flex-1 place-items-center rounded-[min(var(--radius),4px)] bg-foreground/10">
      <ImageIcon className="size-3 text-foreground/30" />
    </div>
  ),
  imgS: () => <div className="aspect-square w-full max-w-7 min-w-5 shrink-0 rounded-[min(var(--radius),3px)] bg-foreground/12" />,
  vid: () => (
    <div className="grid aspect-video w-full place-items-center rounded-[min(var(--radius),4px)] bg-foreground/15">
      <span className="grid size-4 place-items-center rounded-full bg-primary">
        <Play className="size-2 fill-primary-foreground text-primary-foreground" />
      </span>
    </div>
  ),
  play: () => (
    <span className="grid size-8 place-items-center rounded-full bg-primary">
      <Play className="size-3.5 fill-primary-foreground text-primary-foreground" />
    </span>
  ),
  icon: () => <div className="size-3 shrink-0 rounded-[3px] bg-primary/70" />,
  logo: () => <div className={cn(bar, "h-1.5 w-full bg-foreground/30")} />,
  av: () => <div className="size-3 shrink-0 rounded-full bg-foreground/30" />,
  avL: () => <div className="size-5 shrink-0 rounded-full bg-foreground/25" />,
  avrow: () => (
    <div className="flex -space-x-1">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="size-4 rounded-full border border-background bg-foreground/30" />
      ))}
    </div>
  ),
  num: () => <div className="h-3 w-7 rounded-sm bg-primary/85" />,
  input: () => <div className="h-3 w-full rounded-[min(var(--radius),4px)] border border-foreground/30" />,
  inputBtn: () => (
    <div className="flex w-full max-w-36 gap-1">
      <div className="h-3 flex-1 rounded-[min(var(--radius),4px)] border border-foreground/30" />
      <div className="h-3 w-8 rounded-[min(var(--radius),4px)] bg-primary" />
    </div>
  ),
  inputLine: () => <div className="h-3 w-2/3 border-b-2 border-foreground/40" />,
  quote: () => <div className="h-3 font-serif text-xl leading-none text-primary">“</div>,
  star: () => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="size-1.5 rounded-full bg-accent" style={{ filter: "saturate(1.4)" }} />
      ))}
    </div>
  ),
  check: () => (
    <div className="flex w-full items-center gap-1">
      <div className="size-1.5 shrink-0 rounded-full bg-primary" />
      <div className={cn(bar, "h-1 flex-1 bg-foreground/20")} />
    </div>
  ),
  hr: () => <div className="h-px w-full bg-foreground/20" />,
  vr: () => <div className="w-px self-stretch bg-foreground/20" />,
  faq: () => (
    <div className="flex w-full items-center justify-between border-b border-foreground/15 py-1">
      <div className={cn(bar, "h-1 w-3/5 bg-foreground/45")} />
      <Plus className="size-2 text-foreground/50" />
    </div>
  ),
  price: () => <div className="h-3 w-9 rounded-sm bg-foreground/80" />,
  links: () => (
    <div className="flex gap-2">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className={cn(bar, "h-1 w-5 bg-foreground/35")} />
      ))}
    </div>
  ),
  tabs: () => (
    <div className="flex gap-1">
      <div className="h-2.5 w-8 rounded-full bg-primary" />
      <div className="h-2.5 w-8 rounded-full bg-foreground/15" />
      <div className="h-2.5 w-8 rounded-full bg-foreground/15" />
    </div>
  ),
  seg: () => (
    <div className="flex rounded-full border border-foreground/25 p-0.5">
      <div className="h-2 w-7 rounded-full bg-primary" />
      <div className="h-2 w-7" />
    </div>
  ),
  arrow: () => (
    <span className="grid size-4 place-items-center rounded-full border border-foreground/30">
      <ChevronLeft className="size-2.5 text-foreground/60" />
    </span>
  ),
  slider: () => (
    <div className="relative my-1 h-1 w-3/4 rounded-full bg-foreground/15">
      <div className="h-1 w-3/5 rounded-full bg-primary" />
      <div className="absolute top-1/2 left-3/5 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-background" />
    </div>
  ),
  browser: () => (
    <div className="w-4/5 overflow-hidden rounded-lg border border-foreground/20 shadow-sm">
      <div className="flex gap-0.5 border-b border-foreground/15 bg-foreground/5 px-1.5 py-1">
        <span className="size-1 rounded-full bg-[#FF5F57]" />
        <span className="size-1 rounded-full bg-[#FEBC2E]" />
        <span className="size-1 rounded-full bg-[#28C840]" />
      </div>
      <div className="grid h-14 place-items-center bg-foreground/8">
        <span className="grid size-5 place-items-center rounded-full bg-primary">
          <Play className="size-2.5 fill-primary-foreground text-primary-foreground" />
        </span>
      </div>
    </div>
  ),
  mock: () => (
    <div className="relative min-h-20 w-full flex-1">
      <div className="absolute inset-x-2 top-1 bottom-3 rounded-lg bg-foreground/10" />
      <div className="absolute top-0 right-0 flex w-12 flex-col gap-1 rounded-md border border-foreground/10 bg-card p-1.5 shadow-md">
        <div className="h-1 w-full rounded-full bg-primary/70" />
        <div className="h-1 w-2/3 rounded-full bg-foreground/20" />
      </div>
      <div className="absolute bottom-0 left-0 flex w-14 items-center gap-1 rounded-md border border-foreground/10 bg-card p-1.5 shadow-md">
        <div className="size-2.5 rounded-full bg-accent" />
        <div className="h-1 flex-1 rounded-full bg-foreground/25" />
      </div>
    </div>
  ),
  marquee: () => (
    <div className="w-full overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_20%,#000_80%,transparent)]">
      <div className="flex w-[200%] gap-3 [animation:dp-marquee_8s_linear_infinite]">
        {Array.from({ length: 16 }, (_, i) => (
          <div key={i} className={cn(bar, "h-1.5 flex-1 bg-foreground/30")} />
        ))}
      </div>
    </div>
  ),
  hub: () => (
    <div className="relative mx-auto size-20">
      <div className="absolute inset-3 rounded-full border border-dashed border-foreground/25" />
      <div className="absolute top-1/2 left-1/2 grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg bg-primary">
        <div className="size-2 rounded-sm bg-primary-foreground" />
      </div>
      {Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2
        return (
          <div
            key={i}
            className="absolute size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-md border border-foreground/15 bg-card shadow-sm"
            style={{ left: `${50 + Math.cos(a) * 42}%`, top: `${50 + Math.sin(a) * 42}%` }}
          />
        )
      })}
    </div>
  ),
  bento: () => (
    <div className="grid w-full grid-cols-4 grid-rows-2 gap-1.5" style={{ minHeight: 80 }}>
      <Cell className="col-span-2 row-span-2" big />
      <Cell className="col-span-2" />
      <Cell />
      <Cell />
    </div>
  ),
  masonry: () => (
    <div className="grid w-full grid-cols-3 gap-1.5">
      {[[10, 6], [6, 12], [12, 5]].map((heights, i) => (
        <div key={i} className="flex flex-col gap-1.5">
          {heights.map((h, j) => (
            <div key={j} className="flex flex-col gap-1 rounded-[min(var(--radius),6px)] border border-foreground/15 bg-card p-1.5" style={{ minHeight: h * 4 }}>
              <div className="h-1 w-full rounded-full bg-foreground/20" />
              <div className="h-1 w-2/3 rounded-full bg-foreground/20" />
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  hscroll: () => (
    <div className="flex w-full gap-1.5 overflow-hidden [mask-image:linear-gradient(90deg,#000_75%,transparent)]">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="flex w-[32%] shrink-0 flex-col gap-1 rounded-xl border border-foreground/15 bg-card p-1.5">
          <div className="h-8 rounded-lg bg-foreground/10" />
          <div className="h-1.5 w-4/5 rounded-full bg-foreground/60" />
          <div className="h-1 w-full rounded-full bg-foreground/20" />
        </div>
      ))}
    </div>
  ),
}

function Cell({ className, big }) {
  return (
    <div className={cn("flex flex-col justify-end gap-1 rounded-[min(var(--radius),6px)] bg-foreground/10 p-1.5", className)}>
      <div className={cn("h-1.5 rounded-full bg-foreground/50", big ? "w-2/3" : "w-4/5")} />
      {big && <div className="h-1 w-full rounded-full bg-foreground/20" />}
    </div>
  )
}

function Table({ cols, rows, hl }) {
  return (
    <div className="w-full overflow-hidden rounded-[min(var(--radius),4px)] border border-foreground/15">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className={cn("grid border-foreground/10 not-last:border-b", r === 0 && "bg-foreground/8")} style={{ gridTemplateColumns: `1.6fr repeat(${cols - 1}, 1fr)` }}>
          {Array.from({ length: cols }, (_, c) => (
            <div key={c} className={cn("flex h-3.5 items-center px-1", c === hl && "bg-primary/15", c > 0 && "justify-center")}>
              {r === 0 || c === 0 ? (
                <div className={cn("h-1 rounded-full", r === 0 ? "w-3/4 bg-foreground/60" : "w-4/5 bg-foreground/25")} />
              ) : (
                <div className={cn("size-1.5 rounded-full", (r + c) % 3 ? "bg-primary" : "bg-foreground/15")} />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function VerticalTimeline({ alt }) {
  return (
    <div className="relative flex w-full flex-col gap-2 py-1">
      <div className={cn("absolute top-0 bottom-0 w-px bg-foreground/25", alt ? "left-1/2" : "left-1.5")} />
      {[0, 1, 2].map((i) => {
        const right = alt && i % 2 === 1
        return (
          <div key={i} className={cn("relative flex items-center", alt ? (right ? "justify-end" : "justify-start") : "pl-5")}>
            <div className={cn("absolute size-2 -translate-x-1/2 rounded-full bg-primary", alt ? "left-1/2" : "left-1.5")} />
            <div className={cn("flex flex-col gap-1 rounded-md border border-foreground/15 bg-card p-1.5", alt ? "w-[42%]" : "w-full")}>
              <div className="h-1.5 w-1/2 rounded-full bg-foreground/60" />
              <div className="h-1 w-full rounded-full bg-foreground/20" />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function HorizontalTimeline() {
  return (
    <div className="relative w-full py-2">
      <div className="absolute top-[13px] right-4 left-4 h-px bg-foreground/25" />
      <div className="relative grid grid-cols-4 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className={cn("size-3 rounded-full border-2 border-primary", i < 2 ? "bg-primary" : "bg-background")} />
            <div className="h-1.5 w-3/4 rounded-full bg-foreground/60" />
            <div className="h-1 w-full rounded-full bg-foreground/20" />
          </div>
        ))}
      </div>
    </div>
  )
}

function Node({ node, hl }) {
  const theme = useScopedTheme()
  if (typeof node === "string") {
    const Leaf = LEAVES[node]
    return Leaf ? <Leaf /> : null
  }
  const kids = (list) => list.map((c, i) => <Node key={i} node={c} />)

  switch (node.t) {
    case "row":
      return (
        <div className="flex w-full items-center gap-2.5">
          {node.c.map((c, i) => (
            <div key={i} className="flex min-w-0 justify-center" style={{ flex: node.w ? node.w[i] : 1 }}>
              <Node node={c} />
            </div>
          ))}
        </div>
      )
    case "col":
      return (
        <div className={cn("flex w-full min-w-0 flex-col gap-1.5", node.center && "items-center text-center [&>*]:mx-auto")}>
          {kids(node.c)}
        </div>
      )
    case "grid":
      return (
        <div className="grid w-full gap-1.5" style={{ gridTemplateColumns: `repeat(${node.cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: node.n }, (_, i) => (
            <Node key={i} node={node.item} hl={node.hl === i} />
          ))}
        </div>
      )
    case "box":
      return (
        <div
          className={cn(
            "flex w-full flex-col gap-1.5 rounded-[min(var(--radius),8px)] border bg-card p-2",
            hl || node.hl ? "border-primary ring-1 ring-primary" : "border-foreground/15"
          )}
        >
          {kids(node.c)}
        </div>
      )
    case "bg": {
      const c = theme?.colors
      const tones = {
        img: { background: "color-mix(in srgb, var(--foreground) 14%, transparent)" },
        muted: { background: "var(--muted)" },
        dark: c && { background: c.text, "--foreground": c.background },
        accent: c && { background: c.primary, "--foreground": onColor(c.primary), "--primary": onColor(c.primary), "--primary-foreground": c.primary },
        gradient: theme && { background: theme.gradient, "--foreground": "#ffffff", "--primary": "#ffffff", "--primary-foreground": "#111111" },
      }
      return (
        <div className="flex w-full flex-col gap-1.5 rounded-[min(var(--radius),6px)] px-3 py-4" style={tones[node.tone]}>
          {kids(node.c)}
        </div>
      )
    }
    case "table":
      return <Table cols={node.cols} rows={node.rows} hl={node.hl} />
    case "vtl":
      return <VerticalTimeline alt={node.alt} />
    case "htl":
      return <HorizontalTimeline />
    default:
      return null
  }
}

/** Thumbnail frame for one layout variant. Must be rendered inside a ThemeScope. */
export function Wireframe({ wire, className }) {
  return (
    <div className={cn("flex min-h-36 items-center bg-background p-4", className)} aria-hidden>
      <Node node={wire} />
    </div>
  )
}
