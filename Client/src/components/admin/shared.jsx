import { useCallback, useEffect, useState } from "react"
import { AlertCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
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

/** Skeleton rows while a section loads. */
export function Loading() {
  return (
    <div className="flex flex-col gap-3 py-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

export function LoadError({ error, onRetry }) {
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertDescription className="flex flex-col items-start gap-3">
        <p>Couldn't load this: {error}</p>
        <Button variant="outline" onClick={onRetry}>
          Try again
        </Button>
      </AlertDescription>
    </Alert>
  )
}

/** Wraps loading / error states around a useAdminData result. */
export function AdminData({ result, children }) {
  if (result.status === "loading") return <Loading />
  if (result.status === "error" && !result.data) return <LoadError error={result.error} onRetry={result.reload} />
  return children(result.data)
}

// Legacy tone names; any other tone is used as the Badge variant (success, warning, destructive, ...).
const PILL = { neutral: "secondary", brand: "default" }

/** Status tag; `tone` maps onto a Badge variant. */
export function Pill({ tone = "neutral", children, className }) {
  return (
    <Badge variant={PILL[tone] ?? tone} className={className}>
      {children}
    </Badge>
  )
}

export function Pager({ page, pageSize, total, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  return (
    <Pagination className="mx-0 w-auto justify-end">
      <PaginationContent className="gap-1">
        <PaginationItem>
          <Button variant="ghost" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className="pl-1.5">
            <ChevronLeft />
            <span className="hidden sm:block">Previous</span>
          </Button>
        </PaginationItem>
        <PaginationItem className="px-2 text-sm text-muted-foreground tabular-nums">
          Page {page} of {pages}
        </PaginationItem>
        <PaginationItem>
          <Button variant="ghost" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)} className="pr-1.5">
            <span className="hidden sm:block">Next</span>
            <ChevronRight />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

/** Horizontal usage meter. A null limit is unlimited; so is 0 when `zeroIsUnlimited` (token budgets). */
export function Meter({ used, limit, format = fmtNumber, zeroIsUnlimited = false }) {
  const unlimited = limit == null || (limit === 0 && zeroIsUnlimited)
  const pct = unlimited ? 0 : limit === 0 ? 100 : Math.min(100, (used / limit) * 100)
  return (
    <div className="min-w-0">
      <div className="flex justify-between gap-2 text-xs text-muted-foreground">
        <span className="font-medium text-foreground tabular-nums">{format(used)}</span>
        <span>{unlimited ? "Unlimited" : `of ${format(limit)}`}</span>
      </div>
      {!unlimited && <Progress value={pct} className={cn("mt-1 h-1.5", pct >= 100 && "[&>[data-slot=progress-indicator]]:bg-destructive")} />}
    </div>
  )
}
