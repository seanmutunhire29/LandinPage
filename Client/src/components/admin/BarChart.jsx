import { useMemo, useState } from "react"
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Table2, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const dayLabel = (d) => new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })

/**
 * Daily (stacked) bar chart on shadcn Chart / Recharts. `series` = [{key, label, color}]
 * stacked bottom-up (colors are CSS values such as `var(--chart-1)`);
 * `data` = [{day, [key]: number}]. Hover shows a tooltip for the day; a legend
 * appears for two or more series, and the table toggle shows the raw numbers.
 */
export function BarChart({ data, series, format = (n) => n.toLocaleString(), height = 180 }) {
  const [asTable, setAsTable] = useState(false)
  const config = useMemo(() => Object.fromEntries(series.map((s) => [s.key, { label: s.label, color: s.color }])), [series])
  const labelEvery = Math.ceil(data.length / 6)

  return (
    <div className="min-w-0">
      <div className="mb-3 flex justify-end">
        <Button variant="ghost" size="sm" onClick={() => setAsTable((v) => !v)}>
          {asTable ? <BarChart3 /> : <Table2 />}
          {asTable ? "Chart" : "Table"}
        </Button>
      </div>

      {asTable ? (
        <div className="max-h-64 overflow-auto rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 bg-muted">
              <TableRow>
                <TableHead className="px-3">Day</TableHead>
                {series.map((s) => (
                  <TableHead key={s.key} className="px-3 text-right">
                    {s.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((d) => (
                <TableRow key={d.day}>
                  <TableCell className="px-3">{dayLabel(d.day)}</TableCell>
                  {series.map((s) => (
                    <TableCell key={s.key} className="px-3 text-right tabular-nums">
                      {format(d[s.key] || 0)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <ChartContainer config={config} className="aspect-auto w-full" style={{ height: series.length > 1 ? height + 32 : height }}>
          <RechartsBarChart accessibilityLayer data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} interval={labelEvery - 1} tickFormatter={dayLabel} minTickGap={8} />
            <YAxis tickLine={false} axisLine={false} tickMargin={4} width={44} tickCount={3} tickFormatter={(v) => format(v)} />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => (payload?.[0]?.payload?.day ? dayLabel(payload[0].payload.day) : null)}
                  formatter={(value, name, item) => (
                    <>
                      <div className="size-2.5 shrink-0 rounded-[2px]" style={{ background: item.color }} />
                      <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                        <span className="text-muted-foreground">{config[name]?.label ?? name}</span>
                        <span className="font-mono font-medium text-foreground tabular-nums">{format(value || 0)}</span>
                      </div>
                    </>
                  )}
                />
              }
            />
            {series.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
            {series.map((s, i) => (
              <Bar
                key={s.key}
                dataKey={s.key}
                stackId="total"
                fill={`var(--color-${s.key})`}
                maxBarSize={24}
                radius={i === series.length - 1 ? [4, 4, 0, 0] : 0}
              />
            ))}
          </RechartsBarChart>
        </ChartContainer>
      )}
    </div>
  )
}
