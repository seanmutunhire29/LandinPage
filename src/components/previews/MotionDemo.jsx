import { useEffect, useRef, useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useScopedTheme } from "@/components/wizard/ThemeScope"

// Live demo tile for each motion preset, driven by the preset's own duration
// scale and easing curve (scaled by the direction's timing factor).

function useReplay() {
  const [run, setRun] = useState(0)
  return [run, () => setRun((n) => n + 1)]
}

const anim = (name, ms, easing, delay = 0) => ({
  animation: `${name} ${ms}ms ${easing} ${delay}ms both`,
})

function Bars({ run, ms, easing, stagger = 0 }) {
  return (
    <div key={run} className="flex w-40 flex-col gap-2">
      {[100, 80, 60].map((w, i) => (
        <div key={i} className="h-2.5 rounded-full bg-foreground/25" style={{ width: `${w}%`, ...anim("dp-fade-up", ms, easing, i * stagger) }} />
      ))}
    </div>
  )
}

const TYPEWRITER_TEXT = "Ship pages that feel like you."

// Remounted via `key` on replay, so it always starts from an empty string.
function Typewriter({ charMs }) {
  const text = TYPEWRITER_TEXT
  const [n, setN] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setN((x) => (x >= text.length ? x : x + 1)), charMs)
    return () => clearInterval(id)
  }, [text, charMs])
  const { headingStyle } = useScopedTheme()
  return (
    <p className="w-48 text-lg leading-snug" style={headingStyle}>
      {text.slice(0, n)}
      <span className="ml-0.5 inline-block h-5 w-0.5 translate-y-1 bg-primary [animation:dp-caret_1s_steps(1)_infinite]" />
    </p>
  )
}

function Magnetic({ strength, ms, easing }) {
  const ref = useRef(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const { controlStyle } = useScopedTheme()
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    setOffset({ x: (e.clientX - (r.left + r.width / 2)) * strength, y: (e.clientY - (r.top + r.height / 2)) * strength })
  }
  return (
    <div className="grid size-full place-items-center" onMouseMove={move} onMouseLeave={() => setOffset({ x: 0, y: 0 })}>
      <Button
        ref={ref}
        size="lg"
        style={{ ...controlStyle, transform: `translate(${offset.x}px, ${offset.y}px)`, transition: `transform ${ms}ms ${easing}` }}
      >
        Move near me
      </Button>
    </div>
  )
}

function Parallax({ depths }) {
  const [y, setY] = useState(0)
  const { colors, gradient } = useScopedTheme()
  return (
    <div className="relative h-full w-full overflow-y-auto" onScroll={(e) => setY(e.currentTarget.scrollTop)}>
      <div className="sticky top-0 h-full overflow-hidden">
        <div className="absolute inset-x-0 -top-10 h-64 opacity-50" style={{ background: gradient, transform: `translateY(${-y * depths[0]}px)` }} />
        <div className="absolute top-10 left-6 size-14 rounded-full" style={{ background: colors.accent, transform: `translateY(${-y * depths[1]}px)` }} />
        <div className="absolute top-20 right-6 h-10 w-24 rounded-lg shadow-lg" style={{ background: colors.surface, transform: `translateY(${-y * depths[2]}px)` }} />
      </div>
      <div className="h-[260%]" />
      <span className="pointer-events-none absolute right-2 bottom-2 rounded-full bg-foreground/80 px-2 py-0.5 text-[10px] font-medium text-background">Scroll ↓</span>
    </div>
  )
}

export function MotionDemo({ preset, timing = 1 }) {
  const [run, replay] = useReplay()
  const scale = (ms) => Math.round(ms * timing)
  const { base, slow } = { base: scale(preset.durationScale.base), slow: scale(preset.durationScale.slow) }
  const { easing } = preset
  const { controlStyle, cardStyle } = useScopedTheme()

  const replayable = ["fade", "expressive", "spring", "stagger", "typewriter"].includes(preset.demo)
  let body
  switch (preset.demo) {
    case "none":
      body = (
        <div className="group flex w-40 flex-col gap-2">
          <div className="h-10 rounded-lg bg-primary/80 group-hover:translate-x-8" />
          <p className="text-xs text-muted-foreground">Hover: it jumps, no transition</p>
        </div>
      )
      break
    case "fade":
      body = <Bars run={run} ms={base} easing={easing} />
      break
    case "lift":
      body = (
        <div
          className="w-40 rounded-xl p-4 hover:-translate-y-1.5 hover:shadow-xl"
          style={{ ...cardStyle, transition: `transform ${base}ms ${easing}, box-shadow ${base}ms ${easing}` }}
        >
          <div className="h-2.5 w-2/3 rounded-full bg-foreground/60" />
          <div className="mt-2 h-2 w-full rounded-full bg-foreground/20" />
          <p className="mt-3 text-xs text-muted-foreground">Hover to lift</p>
        </div>
      )
      break
    case "expressive":
      body = (
        <div key={run} className="flex items-center gap-3">
          <div className="size-14 rounded-2xl bg-primary" style={anim("dp-pop", slow, easing)} />
          <div className="flex flex-col gap-2">
            <div className="h-3 w-24 rounded-full bg-foreground/60" style={anim("dp-fade-up", slow, easing, 150)} />
            <div className="h-2.5 w-16 rounded-full bg-foreground/25" style={anim("dp-fade-up", slow, easing, 300)} />
          </div>
        </div>
      )
      break
    case "spring":
      body = (
        <Button
          key={run}
          size="lg"
          className="active:scale-90"
          style={{ ...controlStyle, ...anim("dp-pop", base, easing), transition: `transform ${base}ms ${easing}` }}
        >
          Press me
        </Button>
      )
      break
    case "stagger":
      body = (
        <div key={run} className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="size-9 rounded-lg bg-primary/80" style={anim("dp-fade-up", base, easing, i * preset.staggerMs)} />
          ))}
        </div>
      )
      break
    case "parallax":
      body = <Parallax depths={preset.parallaxDepth} />
      break
    case "magnetic":
      body = <Magnetic strength={preset.magnetStrength} ms={base} easing={easing} />
      break
    case "typewriter":
      body = <Typewriter key={run} charMs={preset.charDelayMs} />
      break
    case "morph":
      body = <div className="size-20 bg-primary" style={{ animation: `dp-morph ${slow * 4}ms ${easing} infinite`, backgroundImage: "var(--dp-gradient)" }} />
      break
    default:
      body = null
  }

  return (
    <div className="relative grid h-44 place-items-center overflow-hidden bg-background" onMouseEnter={replayable ? replay : undefined}>
      {body}
      {replayable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            replay()
          }}
          className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-foreground/10 px-2 py-1 text-[11px] font-medium text-foreground/70 hover:bg-foreground/15"
        >
          <RotateCcw className="size-3" /> Replay
        </button>
      )}
    </div>
  )
}
