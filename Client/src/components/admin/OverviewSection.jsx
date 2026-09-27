import { useState } from "react"
import { Link } from "react-router-dom"
import { adminApi } from "@/lib/api"
import { Segmented } from "@/components/brand/segmented"
import { SettingsCard, SettingsHeader } from "@/components/settings/SettingsCard"
import { surfaceVariants } from "@/components/brand/surface"
import { cn } from "@/lib/utils"
import { BarChart } from "./BarChart"
import { AdminData, fmtCost, fmtNumber, fmtTokens, useAdminData } from "./shared"

const RANGES = [
  { id: "7", label: "7 days" },
  { id: "30", label: "30 days" },
  { id: "90", label: "90 days" },
]

// Validated pair (dataviz validate_palette, light surface): platform = brand violet, own keys = aqua.
const PLATFORM = "#7c3aed"
const OWN_KEY = "#1baf7a"

function Stat({ label, value, caption }) {
  return (
    <div className={cn(surfaceVariants(), "p-5")}>
      <p className="text-xs font-semibold text-brand-subtle">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold text-brand-navy tabular-nums">{value}</p>
      {caption && <p className="mt-0.5 text-xs text-brand-muted">{caption}</p>}
    </div>
  )
}

export function OverviewSection() {
  const [days, setDays] = useState("30")
  const result = useAdminData(() => adminApi.stats(Number(days)), [days])

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SettingsHeader title="Overview" description="Signups, usage and spend on the platform key." />
        <Segmented options={RANGES} value={days} onChange={setDays} label="Time range" className="w-72" />
      </div>
      <AdminData result={result}>
        {({ totals, daily, models, top_users: topUsers }) => (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
                    <Link to={`/admin/users/${r.user_id}`} className="font-semibold text-brand-navy hover:text-brand-dark">
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
                      <span className="font-semibold text-brand-navy">{r.model}</span>{" "}
                      <span className="text-xs text-brand-subtle">{r.source === "platform" ? "platform" : r.provider}</span>
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
  if (!rows.length) return <p className="py-5 text-sm text-brand-subtle">{empty}</p>
  return (
    <table className="my-3 w-full text-sm">
      <thead className="text-left text-xs text-brand-subtle">
        <tr>
          <th className="py-2 font-semibold" />
          <th className="py-2 text-right font-semibold">Calls</th>
          <th className="py-2 text-right font-semibold">Tokens</th>
          <th className="py-2 text-right font-semibold">Cost</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border text-brand-body">
        {rows.map((r, i) => (
          <tr key={i}>
            <td className="max-w-0 truncate py-2 pr-3">{first(r)}</td>
            <td className="py-2 text-right tabular-nums">{fmtNumber(r.calls)}</td>
            <td className="py-2 text-right tabular-nums">{fmtTokens(r.tokens)}</td>
            <td className="py-2 text-right tabular-nums">{fmtCost(r.cost)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
