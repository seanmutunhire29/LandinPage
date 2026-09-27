import { useCallback, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { BrandButton } from "@/components/brand/button"
import { surfaceVariants } from "@/components/brand/surface"
import { cn } from "@/lib/utils"

export const fmtNumber = (n) => (n ?? 0).toLocaleString()

export function fmtTokens(n) {
  n = n ?? 0
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}k`
  return String(n)
}

export const fmtCost = (n) => `$${Number(n ?? 0).toFixed(Number(n) >= 100 ? 0 : 2)}`

export function fmtDate(value, withTime = false) {
  if (!value) return "Never"
  const d = new Date(value)
  return withTime
    ? d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : d.toLocaleDateString(undefined, { dateStyle: "medium" })
}

/** Load `fetcher()` on mount and whenever `deps` change; `reload()` refetches. */
export function useAdminData(fetcher, deps = []) {
  const [state, setState] = useState({ status: "loading", data: null, error: null })
  const load = useCallback(fetcher, deps)

  const reload = useCallback(() => {
    let cancelled = false
    setState((s) => ({ ...s, status: s.data ? "refreshing" : "loading" }))
    load().then(
      (data) => !cancelled && setState({ status: "ready", data, error: null }),
      (err) => !cancelled && setState((s) => ({ ...s, status: "error", error: err.message }))
    )
    return () => {
      cancelled = true
    }
  }, [load])

  useEffect(reload, [reload])
  const setData = (data) => setState({ status: "ready", data, error: null })
  return { ...state, reload, setData }
}

export function Loading() {
  return (
    <div className="grid place-items-center py-24">
      <Loader2 className="size-6 animate-spin text-brand-dark" />
    </div>
  )
}

export function LoadError({ error, onRetry }) {
  return (
    <div className={cn(surfaceVariants(), "flex flex-col items-start gap-3 p-card")}>
      <p className="text-sm text-danger">Couldn't load this: {error}</p>
      <BrandButton variant="outline" onClick={onRetry}>
        Try again
      </BrandButton>
    </div>
  )
}

/** Wraps loading / error states around a useAdminData result. */
export function AdminData({ result, children }) {
  if (result.status === "loading") return <Loading />
  if (result.status === "error" && !result.data) return <LoadError error={result.error} onRetry={result.reload} />
  return children(result.data)
}

const PILL = {
  neutral: "bg-brand-fill text-brand-body",
  brand: "bg-brand/25 text-brand-dark",
  danger: "bg-danger-soft text-danger",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
}

export function Pill({ tone = "neutral", children, className }) {
  return <span className={cn("inline-flex h-5 items-center rounded-full px-2 text-xs font-semibold whitespace-nowrap", PILL[tone], className)}>{children}</span>
}

export function Pager({ page, pageSize, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-end gap-2 text-sm text-brand-muted">
      <span>
        Page {page} of {pages}
      </span>
      <BrandButton variant="ghost" size="icon-sm" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        <ChevronLeft />
      </BrandButton>
      <BrandButton variant="ghost" size="icon-sm" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        <ChevronRight />
      </BrandButton>
    </div>
  )
}

/** Horizontal usage meter. A null limit is unlimited; so is 0 when `zeroIsUnlimited` (token budgets). */
export function Meter({ used, limit, format = fmtNumber, zeroIsUnlimited = false }) {
  const unlimited = limit == null || (limit === 0 && zeroIsUnlimited)
  const pct = unlimited ? 0 : limit === 0 ? 100 : Math.min(100, (used / limit) * 100)
  return (
    <div className="min-w-0">
      <div className="flex justify-between text-xs text-brand-muted">
        <span className="font-semibold text-brand-navy">{format(used)}</span>
        <span>{unlimited ? "Unlimited" : `of ${format(limit)}`}</span>
      </div>
      {!unlimited && (
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-brand-fill">
          <div className={cn("h-full rounded-full", pct >= 100 ? "bg-danger" : "bg-brand-dark")} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  )
}
