import { useState } from "react"
import { Link } from "react-router-dom"
import { adminApi } from "@/lib/api"
import { SettingsCard, SettingsHeader } from "@/components/settings/SettingsCard"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { BarChart } from "./BarChart"
import { AdminData, fmtCost, fmtNumber, fmtTokens, useAdminData } from "./shared"

const RANGES = [
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
]

// Theme chart tokens (light and dark each define their own steps): platform key, then own keys.
const PLATFORM = "var(--chart-1)"
const OWN_KEY = "var(--chart-2)"

function Stat({ label, value, caption }) {
  return (
    <Card>
      <CardContent className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums md:text-3xl">{value}</p>
        {caption && <p className="mt-1 text-xs text-muted-foreground">{caption}</p>}
      </CardContent>
    </Card>
  )
}

export function OverviewSection() {
  const [days, setDays] = useState("30")
  const result = useAdminData(() => adminApi.stats(Number(days)), [days])

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SettingsHeader title="Overview" description="Signups, usage and spend on the platform key." />
        <ToggleGroup type="single" variant="outline" spacing={0} value={days} onValueChange={(v) => v && setDays(v)} aria-label="Time range">
          {RANGES.map((r) => (
            <ToggleGroupItem key={r.id} value={r.id} className="px-3">
              {r.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <AdminData result={result}>
        {({ totals, daily, models, top_users: topUsers }) => (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
              <Stat label="Users" value={fmtNumber(totals.users)} caption={`+${fmtNumber(totals.new_users)} in ${days} days`} />
              <Stat label="Projects" value={fmtNumber(totals.projects)} caption={`${fmtNumber(totals.suspended)} suspended users`} />
              <Stat label="Platform tokens" value={fmtTokens(totals.platform_tokens)} caption={`${fmtTokens(totals.user_tokens)} on users' own keys`} />
              <Stat label="Platform spend" value={fmtCost(totals.platform_cost)} caption={`${fmtNumber(totals.calls)} model calls`} />
            </div>

            <SettingsCard title="Signups per day">
              <div className="py-5">
                <BarChart data={daily} series={[{ key: "signups", label: "Signups", color: PLATFORM }]} />
              </div>
            </SettingsCard>

            <SettingsCard title="Tokens per day" description="Platform key (your spend) and users' own keys.">
              <div className="py-5">
                <BarChart
                  data={daily}
                  format={fmtTokens}
                  series={[
                    { key: "platform_tokens", label: "Platform key", color: PLATFORM },
                    { key: "user_tokens", label: "Own keys", color: OWN_KEY },
                  ]}
                />
              </div>
            </SettingsCard>

            <div className="grid gap-6 xl:grid-cols-2">
              <SettingsCard title="Top users" description="By platform tokens in this range.">
                <UsageTable
                  rows={topUsers}
                  empty="No platform usage yet."
                  first={(r) => (
                    <Link to={`/admin/users/${r.user_id}`} className="font-medium underline-offset-4 hover:underline">
                      {r.email}
                    </Link>
                  )}
                />
              </SettingsCard>
              <SettingsCard title="Models" description="Calls and tokens per model.">
                <UsageTable
                  rows={models}
                  empty="No model calls yet."
                  first={(r) => (
                    <span>
                      <span className="font-medium">{r.model}</span>{" "}
                      <span className="text-xs text-muted-foreground">{r.source === "platform" ? "platform" : r.provider}</span>
                    </span>
                  )}
                />
              </SettingsCard>
            </div>
          </div>
        )}
      </AdminData>
    </>
  )
}

function UsageTable({ rows, first, empty }) {
  if (!rows.length) return <p className="py-5 text-sm text-muted-foreground">{empty}</p>
  return (
    <Table className="my-3 table-fixed">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="px-0 text-muted-foreground" />
          <TableHead className="w-16 text-right text-muted-foreground">Calls</TableHead>
          <TableHead className="w-20 text-right text-muted-foreground">Tokens</TableHead>
          <TableHead className="w-20 pr-0 text-right text-muted-foreground">Cost</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i}>
            <TableCell className="truncate px-0">{first(r)}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtNumber(r.calls)}</TableCell>
            <TableCell className="text-right tabular-nums">{fmtTokens(r.tokens)}</TableCell>
            <TableCell className="pr-0 text-right tabular-nums">{fmtCost(r.cost)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
