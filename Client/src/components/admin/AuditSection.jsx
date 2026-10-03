import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { adminApi } from "@/lib/api"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SettingsCard, SettingsHeader } from "@/components/settings/SettingsCard"
import { AdminData, fmtDate, Pager, Pill, useAdminData } from "./shared"

const ACTIONS = {
  "user.limits": ["Changed limits", "neutral"],
  "user.suspend": ["Suspended user", "destructive"],
  "user.unsuspend": ["Unsuspended user", "success"],
  "user.promote": ["Made admin", "brand"],
  "user.demote": ["Removed admin", "warning"],
  "user.delete": ["Deleted user", "destructive"],
  "settings.update": ["Updated model & limits", "brand"],
  "platform_key.update": ["Saved built-in model key", "brand"],
  "platform_key.delete": ["Removed built-in model key", "warning"],
  "system_prompt.update": ["Edited system prompt", "brand"],
  "system_prompt.reset": ["Reset system prompt", "warning"],
  "announcement.update": ["Updated announcement", "neutral"],
}

function Details({ entry }) {
  const { action, details } = entry
  if (action.startsWith("system_prompt")) {
    return (
      <Collapsible className="w-full text-xs">
        <CollapsibleTrigger className="group/trigger inline-flex items-center gap-1 rounded-sm text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
          <ChevronRight className="size-3.5 transition-transform group-data-[state=open]/trigger:rotate-90" />
          Previous version
        </CollapsibleTrigger>
        <CollapsibleContent>
          <pre className="mt-2 max-h-64 overflow-auto rounded-lg border bg-muted/40 p-3 font-mono whitespace-pre-wrap">{details.previous}</pre>
        </CollapsibleContent>
      </Collapsible>
    )
  }
  if (action === "settings.update") {
    return (
      <span className="text-xs wrap-anywhere text-muted-foreground">
        {Object.entries(details)
          .map(([k, v]) => `${k}: ${JSON.stringify(v.from)} → ${JSON.stringify(v.to)}`)
          .join(" · ")}
      </span>
    )
  }
  const { email, ...rest } = details
  const text = Object.entries(rest)
    .filter(([, v]) => v !== "" && v !== undefined)
    .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
    .join(" · ")
  return <span className="text-xs wrap-anywhere text-muted-foreground">{[email, text].filter(Boolean).join(" · ")}</span>
}

export function AuditSection() {
  const [page, setPage] = useState(1)
  const result = useAdminData(() => adminApi.audit(page), [page])
  return (
    <>
      <SettingsHeader title="Audit log" description="Every change made from this dashboard." />
      <SettingsCard footer={result.data && <Pager page={page} pageSize={result.data.page_size} total={result.data.total} onPage={setPage} />}>
        <AdminData result={result}>
          {({ entries }) =>
            entries.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Nothing yet.</p>
            ) : (
              entries.map((e) => {
                const [label, tone] = ACTIONS[e.action] ?? [e.action, "neutral"]
                return (
                  <div key={e.id} className="grid gap-1 py-4 md:grid-cols-[180px_minmax(0,1fr)] md:gap-6">
                    <div className="min-w-0 text-xs text-muted-foreground">
                      <p>{fmtDate(e.created_at, true)}</p>
                      <p className="truncate">{e.admin_email}</p>
                    </div>
                    <div className="flex min-w-0 flex-col items-start gap-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Pill tone={tone}>{label}</Pill>
                        {e.target_user_id && e.action !== "user.delete" && (
                          <Link to={`/admin/users/${e.target_user_id}`} className="rounded-sm text-xs font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50">
                            View user
                          </Link>
                        )}
                      </div>
                      <Details entry={e} />
                    </div>
                  </div>
                )
              })
            )
          }
        </AdminData>
      </SettingsCard>
    </>
  )
}
