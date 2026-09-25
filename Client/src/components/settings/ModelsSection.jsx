import { useState } from "react"
import { ChevronsUpDown, ExternalLink, Eye, EyeOff, Info, KeyRound, Loader2, Sparkles } from "lucide-react"
import { hasKey, providerById, useAccountStore } from "@/store/useAccountStore"
import { ProviderTile } from "@/components/account/UserAvatar"
import { Button } from "@/components/ui/button"
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
              "flex flex-col items-start gap-2 rounded-xl p-3 text-left ring-1 transition-all",
              active ? "bg-[#f5f5ff] ring-2 ring-brand" : "bg-white ring-[#e3e5f0] hover:ring-brand/40"
            )}
          >
            <ProviderTile provider={p.id} />
            <span className="text-sm font-semibold text-brand-navy">{p.label}</span>
            <span className={cn("text-[11px] font-medium", hasKey(settings, p.id) ? "text-[#00854b]" : "text-[#9699a6]")}>
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
      <PopoverTrigger className="flex h-9 w-full items-center gap-2 rounded-lg border border-[#d7d9e6] bg-white px-2.5 text-left text-sm text-brand-navy shadow-[0_1px_1px_rgb(24_27_52/0.03)] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
        <span className="min-w-0 flex-1 truncate font-medium">{settings.model}</span>
        <ChevronsUpDown className="size-3.5 text-[#9699a6]" />
      </PopoverTrigger>
      <PopoverContent align="end" className="h-80 w-(--radix-popover-trigger-width) min-w-72 p-1.5">
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
    <div className="py-4">
      <div className="flex flex-wrap items-center gap-3">
        <ProviderTile provider={provider.id} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-brand-navy">{provider.label}</p>
          <a href={provider.key_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-[#9699a6] hover:text-brand">
            Get a key <ExternalLink className="size-3" />
          </a>
        </div>
        {saved ? (
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-[#e6faf1] px-2.5 font-mono text-[11px] font-semibold text-[#00854b] ring-1 ring-brand-green/25 ring-inset">
            <span className="size-1.5 rounded-full bg-brand-green" />
            {saved.last4 ? `•••• ${saved.last4}` : "Connected"}
          </span>
        ) : (
          <span className="inline-flex h-6 items-center rounded-full bg-[#f1f2f8] px-2.5 text-[11px] font-semibold text-[#9699a6]">Not connected</span>
        )}
        {!editing && (
          <div className="flex gap-1.5">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
              {saved ? "Replace" : "Add key"}
            </Button>
            {saved && (
              <Button type="button" variant="ghost" size="sm" disabled={busy === "delete"} onClick={() => run("delete", () => deleteKey(provider.id))} className="text-[#b3263e] hover:bg-[#fff0f2] hover:text-[#b3263e]">
                {busy === "delete" ? <Loader2 className="animate-spin" /> : "Remove"}
              </Button>
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
          className="mt-3 flex flex-wrap items-center gap-2 sm:pl-11"
        >
          <div className="relative min-w-0 flex-1">
            <input
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={provider.key_hint}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              className="h-9 w-full rounded-lg border border-[#d7d9e6] bg-white pr-9 pl-2.5 font-mono text-[13px] text-brand-navy outline-none placeholder:font-sans placeholder:text-[#9699a6] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label={`${provider.label} API key`}
            />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute top-1/2 right-2 -translate-y-1/2 text-[#9699a6] hover:text-brand-navy" aria-label={show ? "Hide key" : "Show key"}>
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <Button type="submit" disabled={!value.trim() || busy === "save"} className="h-9 bg-brand px-4 text-white hover:bg-brand-dark">
            {busy === "save" ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" /> Checking
              </>
            ) : (
              "Save key"
            )}
          </Button>
          <Button type="button" variant="ghost" className="h-9" onClick={() => {
              setEditing(false)
              setValue("")
              setError(null)
            }}>
            Cancel
          </Button>
        </form>
      )}
      {error && <p className="mt-2 text-xs text-[#b3263e] sm:pl-11">{error}</p>}
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
        <div className="flex items-start gap-3 rounded-2xl bg-gradient-to-br from-[#f1f1ff] to-[#f8f5ff] p-5 ring-1 ring-brand/15">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-white">
            <Sparkles className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display font-semibold text-brand-navy">
              {free.limit === 0 ? "Bring your own key" : `${freeLeft} of ${free.limit} free generation${free.limit === 1 ? "" : "s"} left`}
            </p>
            <p className="mt-0.5 text-sm text-[#676879]">
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
          <div className="py-4">
            <ProviderChoice providers={providers} settings={settings} onChoose={(p) => p.id !== settings.provider && choose(p.id, p.default_model)} />
          </div>
          {provider && (
            <SettingsRow label="Model" description={provider.notes || `Any chat model ${provider.label} offers. Pick from the list or type an id.`}>
              <ModelCombobox provider={provider} settings={settings} onSelect={(model) => choose(provider.id, model)} />
            </SettingsRow>
          )}
          {provider && !hasKey(settings, provider.id) && (
            <div className="-mx-5 flex items-center gap-2 border-t border-[#fde9b3] bg-[#fffaeb] px-5 py-2.5 text-[13px] text-[#8a6100] md:-mx-6 md:px-6">
              <Info className="size-4 shrink-0" /> Add a {provider.label} key below to edit your sites with this model.
            </div>
          )}
          {error && <p className="py-2 text-sm text-[#b3263e]">{error}</p>}
        </SettingsCard>

        <SettingsCard
          title="API keys"
          description="Keys are encrypted on our server and only used for your own requests. We never show them again after saving."
          action={<KeyRound className="size-5 text-[#c3c6d4]" />}
        >
          {providers.map((p) => (
            <KeyRow key={p.id} provider={p} saved={settings.keys.find((k) => k.provider === p.id)} />
          ))}
        </SettingsCard>
      </div>
    </>
  )
}
