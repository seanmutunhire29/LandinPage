import { useEffect, useMemo, useState } from "react"
import { Check, Loader2, Plus, Search } from "lucide-react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

// Live model lists per provider, keyed by provider + saved key so a new key refetches.
const cache = new Map()
const LOADING = { status: "loading", models: [] }

function useLiveModels(providerId, keyStamp) {
  const cacheKey = `${providerId}:${keyStamp ?? ""}`
  const [results, setResults] = useState({})

  useEffect(() => {
    if (cache.has(cacheKey)) return
    let cancelled = false
    api.listModels(providerId).then(
      (res) => {
        const next = { status: res.live ? "live" : "offline", models: res.models }
        cache.set(cacheKey, next)
        if (!cancelled) setResults((r) => ({ ...r, [cacheKey]: next }))
      },
      (err) => !cancelled && setResults((r) => ({ ...r, [cacheKey]: { status: "error", models: [], error: err.message } }))
    )
    return () => {
      cancelled = true
    }
  }, [providerId, cacheKey])

  return cache.get(cacheKey) ?? results[cacheKey] ?? LOADING
}

function Option({ m, selected, onSelect }) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(m.id)}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-[#f1f2f8]",
          selected ? "font-semibold text-brand" : "text-brand-navy"
        )}
      >
        <span className="min-w-0 flex-1 truncate">{m.id}</span>
        {m.name !== m.id && <span className="max-w-[45%] truncate text-[11px] text-[#9699a6]">{m.name}</span>}
        {selected && <Check className="size-3.5 shrink-0" />}
      </button>
    </li>
  )
}

/**
 * Searchable model list for one provider: the server's suggestions first, then the
 * provider's live catalogue (when a key is saved), and a custom id from the search box.
 */
export function ModelOptions({ provider, value, keyStamp, onSelect, className }) {
  const live = useLiveModels(provider.id, keyStamp)
  const [query, setQuery] = useState("")

  const { suggested, rest } = useMemo(() => {
    const q = query.trim().toLowerCase()
    const match = (id) => !q || id.toLowerCase().includes(q)
    const suggestedIds = new Set(provider.models)
    return {
      suggested: provider.models.filter(match).map((id) => ({ id, name: id })),
      rest: live.models.filter((m) => !suggestedIds.has(m.id) && (match(m.id) || match(m.name))),
    }
  }, [query, provider.models, live.models])

  const custom = query.trim()
  const exact = custom && [...suggested, ...rest].some((m) => m.id === custom)

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="relative mb-1.5">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-[#9699a6]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && custom) {
              e.preventDefault()
              onSelect(custom)
            }
          }}
          placeholder="Search or enter a model id"
          className="h-8 w-full rounded-md border border-[#e3e5f0] bg-[#fafbfd] pr-2 pl-8 text-[13px] text-brand-navy outline-none placeholder:text-[#9699a6] focus:border-brand/50 focus:bg-white"
          autoFocus
        />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {suggested.length > 0 && (
          <>
            <p className="px-2 pt-1 pb-0.5 text-[10px] font-semibold tracking-wider text-[#9699a6] uppercase">Suggested</p>
            <ul>
              {suggested.map((m) => (
                <Option key={m.id} m={m} selected={m.id === value} onSelect={onSelect} />
              ))}
            </ul>
          </>
        )}
        {rest.length > 0 && (
          <>
            <p className="px-2 pt-2 pb-0.5 text-[10px] font-semibold tracking-wider text-[#9699a6] uppercase">All models</p>
            <ul>
              {rest.map((m) => (
                <Option key={m.id} m={m} selected={m.id === value} onSelect={onSelect} />
              ))}
            </ul>
          </>
        )}
        {live.status === "loading" && (
          <p className="flex items-center gap-1.5 px-2 py-2 text-xs text-[#9699a6]">
            <Loader2 className="size-3 animate-spin" /> Loading models from {provider.label}...
          </p>
        )}
        {live.status === "offline" && !query && <p className="px-2 py-2 text-xs text-[#9699a6]">Add a {provider.label} key to see every model it offers.</p>}
        {live.status === "error" && <p className="px-2 py-2 text-xs text-[#b3263e]">{live.error}</p>}
        {custom && !exact && (
          <button
            type="button"
            onClick={() => onSelect(custom)}
            className="mt-1 flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] text-brand transition-colors hover:bg-[#eef0fb]"
          >
            <Plus className="size-3.5" /> Use <span className="truncate font-semibold">{custom}</span>
          </button>
        )}
      </div>
    </div>
  )
}
