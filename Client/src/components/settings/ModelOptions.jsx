import { useEffect, useMemo, useState } from "react"
import { ChevronsUpDown, Loader2, Plus } from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

// Live model lists per provider, keyed by provider + saved key so a new key refetches.
const cache = new Map()
const LOADING = { status: "loading", models: [] }

function useLiveModels(providerId, keyStamp, fetchModels) {
  const cacheKey = `${providerId}:${keyStamp ?? ""}`
  const [results, setResults] = useState({})

  useEffect(() => {
    if (cache.has(cacheKey)) return
    let cancelled = false
    fetchModels(providerId).then(
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
  }, [providerId, cacheKey, fetchModels])

  return cache.get(cacheKey) ?? results[cacheKey] ?? LOADING
}

function Option({ m, selected, onSelect }) {
  return (
    <CommandItem value={m.id} data-checked={selected} onSelect={() => onSelect(m.id)}>
      <span className={cn("min-w-0 flex-1 truncate", selected && "font-medium")}>{m.id}</span>
      {m.name !== m.id && <span className="max-w-[45%] truncate text-xs text-muted-foreground">{m.name}</span>}
    </CommandItem>
  )
}

const CUSTOM_PREFIX = "custom:"

/**
 * Searchable model list for one provider (a shadcn Command): the server's suggestions
 * first, then the provider's live catalogue (when a key is saved), and a custom id from
 * the search box. Enter picks the typed id unless you arrow to another option.
 * `fetchModels` loads the live list (default: with the user's own key); give it a
 * distinct `keyStamp` so its results are cached separately.
 */
export function ModelOptions({ provider, value, keyStamp, onSelect, className, fetchModels = api.listModels }) {
  const live = useLiveModels(provider.id, keyStamp, fetchModels)
  const [query, setQuery] = useState("")
  const [highlight, setHighlight] = useState(value ?? "")

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

  const search = (next) => {
    setQuery(next)
    // Typing points Enter at the typed id (an exact match, or the "Use ..." option).
    const id = next.trim()
    const isExact = id && (provider.models.includes(id) || live.models.some((m) => m.id === id))
    setHighlight(id ? (isExact ? id : CUSTOM_PREFIX + id) : "")
  }

  return (
    <Command shouldFilter={false} value={highlight} onValueChange={setHighlight} className={cn("min-h-0 rounded-lg!", className)}>
      <CommandInput value={query} onValueChange={search} placeholder="Search or enter a model id" autoFocus />
      <CommandList className="max-h-none min-h-0 flex-1">
        {live.status !== "loading" && <CommandEmpty>No models found.</CommandEmpty>}
        {custom && !exact && (
          <CommandGroup>
            <CommandItem value={CUSTOM_PREFIX + custom} onSelect={() => onSelect(custom)}>
              <Plus /> Use <span className="truncate font-medium">{custom}</span>
            </CommandItem>
          </CommandGroup>
        )}
        {suggested.length > 0 && (
          <CommandGroup heading="Suggested">
            {suggested.map((m) => (
              <Option key={m.id} m={m} selected={m.id === value} onSelect={onSelect} />
            ))}
          </CommandGroup>
        )}
        {rest.length > 0 && (
          <CommandGroup heading="All models">
            {rest.map((m) => (
              <Option key={m.id} m={m} selected={m.id === value} onSelect={onSelect} />
            ))}
          </CommandGroup>
        )}
        {live.status === "loading" && (
          <p className="flex items-center gap-1.5 px-3 py-2 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" /> Loading models from {provider.label}...
          </p>
        )}
        {live.status === "offline" && !query && <p className="px-3 py-2 text-xs text-muted-foreground">Add a {provider.label} key to see every model it offers.</p>}
        {live.status === "error" && <p className="px-3 py-2 text-xs text-destructive">{live.error}</p>}
      </CommandList>
    </Command>
  )
}

/** Combobox trigger + popover around ModelOptions, shared by settings and the admin platform form. */
export function ModelCombobox({ value, ...options }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} aria-label="Model" className="w-full justify-between font-normal">
          <span className="min-w-0 flex-1 truncate text-left font-medium">{value}</span>
          <ChevronsUpDown className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="h-80 w-(--radix-popover-trigger-width) min-w-72 p-0">
        <ModelOptions
          {...options}
          value={value}
          onSelect={(model) => {
            options.onSelect(model)
            setOpen(false)
          }}
          className="h-full"
        />
      </PopoverContent>
    </Popover>
  )
}
