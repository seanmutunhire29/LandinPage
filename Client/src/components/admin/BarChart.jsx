import { useState } from "react"
import { Table2, BarChart3 } from "lucide-react"
import { BrandButton } from "@/components/brand/button"
import { cn } from "@/lib/utils"

/** A "nice" axis ceiling: 1, 2, 2.5 or 5 times a power of ten. */
function niceMax(v) {
  if (v <= 0) return 1
  const p = 10 ** Math.floor(Math.log10(v))
  return [1, 2, 2.5, 5, 10].map((m) => m * p).find((m) => m >= v)
}

const dayLabel = (d) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })

/**
 * Daily (stacked) bar chart. `series` = [{key, label, color}] stacked bottom-up;
 * `data` = [{day, [key]: number}]. Hover shows a tooltip for the day; a legend
 * appears for two or more series, and the table toggle shows the raw numbers.
 */
export function BarChart({ data, series, format = (n) => n.toLocaleString(), height = 180 }) {
  const [hover, setHover] = useState(null)
  const [asTable, setAsTable] = useState(false)
  const totals = data.map((d) => series.reduce((sum, s) => sum + (d[s.key] || 0), 0))
  const max = niceMax(Math.max(0, ...totals))
  const labelEvery = Math.ceil(data.length / 6)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        {series.length > 1 ? (
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-brand-muted">
            {series.map((s) => (
              <li key={s.key} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-[3px]" style={{ background: s.color }} />
                {s.label}
              </li>
            ))}
          </ul>
        ) : (
          <span />
        )}
        <BrandButton variant="ghost" size="sm" onClick={() => setAsTable((v) => !v)}>
          {asTable ? <BarChart3 /> : <Table2 />}
          {asTable ? "Chart" : "Table"}
        </BrandButton>
      </div>

      {asTable ? (
        <div className="max-h-64 overflow-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-brand-mist text-left text-xs text-brand-subtle">
              <tr>
                <th className="px-3 py-2 font-semibold">Day</th>
                {series.map((s) => (
                  <th key={s.key} className="px-3 py-2 text-right font-semibold">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-brand-body">
              {data.map((d) => (
                <tr key={d.day}>
                  <td className="px-3 py-1.5">{dayLabel(d.day)}</td>
                  {series.map((s) => (
                    <td key={s.key} className="px-3 py-1.5 text-right tabular-nums">
                      {format(d[s.key] || 0)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2">
          <div className="flex flex-col justify-between text-right text-[11px] text-brand-subtle tabular-nums" style={{ height }}>
            <span className="-translate-y-1/2">{format(max)}</span>
            <span>{format(max / 2)}</span>
            <span className="translate-y-1/2">0</span>
          </div>
          <div className="relative" style={{ height }} onMouseLeave={() => setHover(null)}>
            {/* recessive grid: top, middle, baseline */}
            {[0, 50, 100].map((top) => (
              <div key={top} className={cn("absolute inset-x-0 border-t", top === 100 ? "border-brand-subtle/50" : "border-border")} style={{ top: `${top}%` }} />
            ))}
            <div className="absolute inset-0 flex items-end">
              {data.map((d, i) => (
                <div
                  key={d.day}
                  className="relative flex h-full flex-1 flex-col-reverse items-center"
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  tabIndex={0}
                  aria-label={`${dayLabel(d.day)}: ${series.map((s) => `${s.label} ${format(d[s.key] || 0)}`).join(", ")}`}
                >
                  <div className={cn("flex w-[70%] max-w-6 flex-col-reverse gap-[2px]", hover === i && "opacity-80")} style={{ height: `${(totals[i] / max) * 100}%` }}>
                    {series.map((s, si) => {
                      const v = d[s.key] || 0
                      if (!v) return null
                      const topMost = series.slice(si + 1).every((t) => !d[t.key])
                      return <div key={s.key} className={cn(topMost && "rounded-t-[4px]")} style={{ flexGrow: v, flexBasis: 0, minHeight: 2, background: s.color }} />
                    })}
                  </div>
                  {hover === i && (
                    <div
                      className={cn(
                        "pointer-events-none absolute bottom-full z-10 mb-2 w-max rounded-xl bg-brand-navy px-3 py-2 text-xs text-white shadow-float",
                        i < data.length / 2 ? "left-0" : "right-0"
                      )}
                    >
                      <p className="mb-1 font-semibold">{dayLabel(d.day)}</p>
                      {series.map((s) => (
                        <p key={s.key} className="flex items-center gap-1.5">
                          <span className="size-2 rounded-[2px]" style={{ background: s.color }} />
                          {s.label}: <span className="font-semibold tabular-nums">{format(d[s.key] || 0)}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <span />
          <div className="mt-1.5 flex text-[11px] text-brand-subtle">
            {data.map((d, i) => (
              <span key={d.day} className="flex-1 text-center whitespace-nowrap">
                {i % labelEvery === 0 ? dayLabel(d.day) : ""}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
