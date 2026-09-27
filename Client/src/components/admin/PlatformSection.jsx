import { useState } from "react"
import { ChevronsUpDown, Info, KeyRound } from "lucide-react"
import { adminApi } from "@/lib/api"
import { BrandButton } from "@/components/brand/button"
import { BrandInput, fieldVariants } from "@/components/brand/field"
import { SettingsCard, SettingsHeader, SettingsRow } from "@/components/settings/SettingsCard"
import { ModelOptions } from "@/components/settings/ModelOptions"
import { KeyRow } from "@/components/settings/ModelsSection"
import { ProviderTile } from "@/components/account/UserAvatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { AdminData, fmtNumber, useAdminData } from "./shared"

const NUMBER_FIELDS = ["free_generations", "default_token_budget", "max_tokens"]

export function PlatformSection() {
  const result = useAdminData(() => adminApi.getSettings())
  return (
    <>
      <SettingsHeader
        title="Model & limits"
        description="The built-in model everyone gets for free: which provider and model it runs on, the key that pays for it, and how much each account gets."
      />
      <AdminData result={result}>{(data) => <PlatformForm data={data} onSaved={result.setData} />}</AdminData>
    </>
  )
}

function PlatformForm({ data, onSaved }) {
  const { values, defaults, providers, keys } = data
  const [form, setForm] = useState(() => ({ ...values, ...Object.fromEntries(NUMBER_FIELDS.map((k) => [k, String(values[k])])) }))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const provider = providers.find((p) => p.id === form.platform_provider) ?? providers[0]
  const payload = { ...form, ...Object.fromEntries(NUMBER_FIELDS.map((k) => [k, parseInt(form[k], 10) || 0])) }
  const dirty = Object.keys(values).some((k) => payload[k] !== values[k])

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const next = await adminApi.updateSettings(payload)
      onSaved(next)
      setForm((f) => ({ ...f, platform_model: next.values.platform_model }))
      setMessage({ ok: true, text: "Saved. New turns use these settings right away." })
    } catch (e) {
      setMessage({ ok: false, text: e.message })
    } finally {
      setSaving(false)
    }
  }

  const saveButton = (
    <>
      {message && <span className={cn("mr-auto text-sm", message.ok ? "text-success" : "text-danger")}>{message.text}</span>}
      <BrandButton size="sm" disabled={!dirty || saving} onClick={save}>
        Save changes
      </BrandButton>
    </>
  )
  const numberInput = (k) => <BrandInput id={k} inputMode="numeric" value={form[k]} onChange={(e) => set(k, e.target.value.replace(/\D/g, ""))} />
  const envDefault = (k) => `Server default: ${fmtNumber(defaults[k])}.`

  // Key changes save immediately and return the refreshed settings.
  const keyAction = (fn) => async (...args) => onSaved(await fn(...args))
  const selectedKey = keys[provider.id]

  return (
    <div className="flex flex-col gap-6">
      <SettingsCard title="Built-in model" description="Runs each account's free first generations, paid for by your key." footer={saveButton}>
        <SettingsRow label="Enabled" description="Turn off to pause all free generations (maintenance, or out of credit).">
          <Switch checked={form.platform_enabled} onCheckedChange={(v) => set("platform_enabled", v)} />
        </SettingsRow>
        <div className="py-5">
          <p className="mb-3 text-ui font-semibold text-brand-navy">Provider</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {providers.map((p) => {
              const active = p.id === provider.id
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => !active && setForm((f) => ({ ...f, platform_provider: p.id, platform_model: p.default_model }))}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-2xl p-3.5 text-left ring-1 transition-all outline-none focus-visible:ring-4 focus-visible:ring-brand/30",
                    active ? "bg-secondary ring-2 ring-brand" : "bg-white ring-border hover:scale-[1.02] hover:shadow-lift hover:ring-brand/40"
                  )}
                >
                  <ProviderTile provider={p.id} />
                  <span className="font-display text-ui font-semibold text-brand-navy">{p.label}</span>
                  <span className={cn("text-xs font-semibold", keys[p.id] ? "text-success" : "text-brand-subtle")}>{keys[p.id] ? "Key connected" : "No key yet"}</span>
                </button>
              )
            })}
          </div>
        </div>
        <SettingsRow label="Model" description={provider.notes || `Any chat model ${provider.label} offers. Server default: ${defaults.platform_model}.`}>
          <PlatformModelPicker provider={provider} keyStamp={selectedKey?.last4} value={form.platform_model} onChange={(v) => set("platform_model", v)} />
        </SettingsRow>
        <SettingsRow label="Max output tokens per call" htmlFor="max_tokens" description={envDefault("max_tokens")}>
          {numberInput("max_tokens")}
        </SettingsRow>
        {!selectedKey && (
          <div className="-mx-card flex items-center gap-2 border-t border-warning-line bg-warning-soft px-card py-3 text-sm text-warning">
            <Info className="size-4 shrink-0" /> Add a {provider.label} key below, or free generations won't run and everyone will need their own key.
          </div>
        )}
      </SettingsCard>

      <SettingsCard
        title="Built-in model keys"
        description="Your keys pay for everyone's free generations. They're encrypted on the server and never shown again after saving. Only the selected provider's key is used."
        action={<KeyRound className="size-5 text-brand-subtle" />}
      >
        {providers.map((p) => {
          const k = keys[p.id]
          const fromEnv = k?.source === "env"
          return (
            <KeyRow
              key={p.id}
              provider={p}
              saved={k}
              onSave={keyAction(adminApi.savePlatformKey)}
              onDelete={fromEnv ? undefined : keyAction(adminApi.deletePlatformKey)}
              note={fromEnv ? "Using OPENROUTER_API_KEY from server/.env. Saving a key here overrides it." : undefined}
            />
          )
        })}
      </SettingsCard>

      <SettingsCard title="Default limits per user" description="Apply to every account without its own override (set overrides on a user's page)." footer={saveButton}>
        <SettingsRow label="Free generations" htmlFor="free_generations" description={`Projects each account can generate on the built-in model. ${envDefault("free_generations")}`}>
          {numberInput("free_generations")}
        </SettingsRow>
        <SettingsRow
          label="Token budget"
          htmlFor="default_token_budget"
          description={`Total built-in model tokens per account (prompt + completion). 0 = unlimited. ${envDefault("default_token_budget")}`}
        >
          {numberInput("default_token_budget")}
        </SettingsRow>
      </SettingsCard>
    </div>
  )
}

function PlatformModelPicker({ provider, keyStamp, value, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={cn(fieldVariants(), "flex items-center gap-2 text-left")}>
        <span className="min-w-0 flex-1 truncate font-medium">{value}</span>
        <ChevronsUpDown className="size-4 text-brand-subtle" />
      </PopoverTrigger>
      <PopoverContent align="end" className="h-80 w-(--radix-popover-trigger-width) min-w-72 rounded-[26px] p-2 shadow-float ring-0">
        <ModelOptions
          provider={provider}
          value={value}
          keyStamp={`platform:${keyStamp ?? ""}`}
          fetchModels={adminApi.platformModels}
          onSelect={(id) => {
            onChange(id)
            setOpen(false)
          }}
          className="h-full"
        />
      </PopoverContent>
    </Popover>
  )
}
