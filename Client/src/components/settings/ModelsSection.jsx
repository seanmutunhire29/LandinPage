import { useState } from "react"
import { ChevronsUpDown, ExternalLink, Eye, EyeOff, Info, KeyRound, Loader2, Sparkles } from "lucide-react"
import { hasKey, providerById, useAccountStore } from "@/store/useAccountStore"
import { ProviderTile } from "@/components/account/UserAvatar"
import { BrandButton } from "@/components/brand/button"
import { BrandInput, fieldVariants } from "@/components/brand/field"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ModelOptions } from "./ModelOptions"
import { SettingsCard, SettingsHeader, SettingsRow } from "./SettingsCard"
import { shortModel } from "@/lib/providers"
import { cn } from "@/lib/utils"

function ProviderChoice({ providers, settings, onChoose }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {providers.map((p) => {
        const active = settings.provider === p.id
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChoose(p)}
            aria-pressed={active}
            className={cn(
              "flex flex-col items-start gap-2 rounded-2xl p-3.5 text-left ring-1 transition-all outline-none focus-visible:ring-4 focus-visible:ring-brand/30",
              active ? "bg-secondary ring-2 ring-brand" : "bg-white ring-border hover:scale-[1.02] hover:shadow-lift hover:ring-brand/40"
            )}
          >
            <ProviderTile provider={p.id} />
            <span className="font-display text-ui font-semibold text-brand-navy">{p.label}</span>
            <span className={cn("text-xs font-semibold", hasKey(settings, p.id) ? "text-success" : "text-brand-subtle")}>
              {hasKey(settings, p.id) ? "Key connected" : "No key yet"}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function ModelCombobox({ provider, settings, onSelect }) {
  const [open, setOpen] = useState(false)
  const key = settings.keys.find((k) => k.provider === provider.id)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={cn(fieldVariants(), "flex items-center gap-2 text-left aria-expanded:border-brand")}>
        <span className="min-w-0 flex-1 truncate font-medium">{settings.model}</span>
        <ChevronsUpDown className="size-4 text-brand-subtle" />
      </PopoverTrigger>
      <PopoverContent align="end" className="h-80 w-(--radix-popover-trigger-width) min-w-72 rounded-[26px] p-2 shadow-float ring-0">
        <ModelOptions
          provider={provider}
          value={settings.model}
          keyStamp={key?.updated_at}
          onSelect={(model) => {
            onSelect(model)
            setOpen(false)
          }}
          className="h-full"
        />
      </PopoverContent>
    </Popover>
  )
}

function KeyRow({ provider, saved }) {
  const saveKey = useAccountStore((s) => s.saveKey)
  const deleteKey = useAccountStore((s) => s.deleteKey)
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState("")
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(null) // "save" | "delete"
  const [error, setError] = useState(null)

  const run = async (kind, fn) => {
    setBusy(kind)
    setError(null)
    try {
      await fn()
      setEditing(false)
      setValue("")
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="py-5">
      <div className="flex flex-wrap items-center gap-3">
        <ProviderTile provider={provider.id} />
        <div className="min-w-0 flex-1">
          <p className="font-display text-ui font-semibold text-brand-navy">{provider.label}</p>
          <a href={provider.key_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-subtle hover:text-brand-dark">
            Get a key <ExternalLink className="size-3" />
          </a>
        </div>
        {saved ? (
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-success-soft px-2.5 font-mono text-xs font-semibold text-success ring-1 ring-brand-green/25 ring-inset">
            <span className="size-1.5 rounded-full bg-brand-green" />
            {saved.last4 ? `•••• ${saved.last4}` : "Connected"}
          </span>
        ) : (
          <span className="inline-flex h-6 items-center rounded-full bg-muted px-2.5 text-xs font-semibold text-brand-subtle">Not connected</span>
        )}
        {!editing && (
          <div className="flex gap-1.5">
            <BrandButton type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
              {saved ? "Replace" : "Add key"}
            </BrandButton>
            {saved && (
              <BrandButton type="button" variant="danger" size="sm" disabled={busy === "delete"} onClick={() => run("delete", () => deleteKey(provider.id))}>
                {busy === "delete" ? <Loader2 className="animate-spin" /> : "Remove"}
              </BrandButton>
            )}
          </div>
        )}
      </div>
      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (value.trim()) run("save", () => saveKey(provider.id, value.trim()))
          }}
          className="mt-4 flex flex-wrap items-center gap-2 sm:pl-11"
        >
          <div className="relative min-w-0 flex-1">
            <BrandInput
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={provider.key_hint}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              className="pr-10 font-mono text-sm placeholder:font-sans"
              aria-label={`${provider.label} API key`}
            />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute top-1/2 right-3 -translate-y-1/2 text-brand-subtle hover:text-brand-navy" aria-label={show ? "Hide key" : "Show key"}>
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <BrandButton type="submit" disabled={!value.trim() || busy === "save"}>
            {busy === "save" ? (
              <>
                <Loader2 className="animate-spin" /> Checking
              </>
            ) : (
              "Save key"
            )}
          </BrandButton>
          <BrandButton type="button" variant="ghost" onClick={() => {
              setEditing(false)
              setValue("")
              setError(null)
            }}>
            Cancel
          </BrandButton>
        </form>
      )}
      {error && <p className="mt-2 text-xs text-danger sm:pl-11">{error}</p>}
    </div>
  )
}

export function ModelsSection() {
  const settings = useAccountStore((s) => s.settings)
  const providers = useAccountStore((s) => s.providers)
  const selectModel = useAccountStore((s) => s.selectModel)
  const [error, setError] = useState(null)
  const provider = providerById(providers, settings.provider)

  const choose = (providerId, model) => {
    setError(null)
    selectModel(providerId, model).catch((err) => setError(err.message))
  }

  const free = settings.free_generations
  const freeLeft = Math.max(free.limit - free.used, 0)

  return (
    <>
      <SettingsHeader title="Models & API keys" description="Choose which AI builds and edits your sites, and connect your own provider keys." />
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4 rounded-3xl bg-secondary p-card ring-1 ring-brand/15">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-yellow text-brand-navy">
            <Sparkles className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-semibold text-brand-navy">
              {free.limit === 0 ? "Bring your own key" : `${freeLeft} of ${free.limit} free generation${free.limit === 1 ? "" : "s"} left`}
            </p>
            <p className="mt-1 text-ui leading-relaxed text-brand-body">
              {free.limit === 0
                ? "Generation and edits run on your own provider key."
                : `The first version of each new site is on us, built with ${shortModel(settings.platform_model)}. Edits after that use your own key and the model you pick below.`}
            </p>
            {free.limit > 0 && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white ring-1 ring-brand/10" role="progressbar" aria-valuemin={0} aria-valuemax={free.limit} aria-valuenow={free.used}>
                <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${(free.used / free.limit) * 100}%` }} />
              </div>
            )}
          </div>
        </div>

        <SettingsCard title="Default model" description="Used for edits in every project. You can also switch it from the chat box.">
          <div className="py-5">
            <ProviderChoice providers={providers} settings={settings} onChoose={(p) => p.id !== settings.provider && choose(p.id, p.default_model)} />
          </div>
          {provider && (
            <SettingsRow label="Model" description={provider.notes || `Any chat model ${provider.label} offers. Pick from the list or type an id.`}>
              <ModelCombobox provider={provider} settings={settings} onSelect={(model) => choose(provider.id, model)} />
            </SettingsRow>
          )}
          {provider && !hasKey(settings, provider.id) && (
            <div className="-mx-card flex items-center gap-2 border-t border-warning-line bg-warning-soft px-card py-3 text-sm text-warning">
              <Info className="size-4 shrink-0" /> Add a {provider.label} key below to edit your sites with this model.
            </div>
          )}
          {error && <p className="py-2 text-sm text-danger">{error}</p>}
        </SettingsCard>

        <SettingsCard
          title="API keys"
          description="Keys are encrypted on our server and only used for your own requests. We never show them again after saving."
          action={<KeyRound className="size-5 text-brand-subtle" />}
        >
          {providers.map((p) => (
            <KeyRow key={p.id} provider={p} saved={settings.keys.find((k) => k.provider === p.id)} />
          ))}
        </SettingsCard>
      </div>
    </>
  )
}
