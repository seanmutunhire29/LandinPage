import { useEffect, useState } from "react"
import { ChevronsUpDown } from "lucide-react"
import { adminApi, api } from "@/lib/api"
import { BrandButton } from "@/components/brand/button"
import { BrandInput, fieldVariants } from "@/components/brand/field"
import { SettingsCard, SettingsHeader, SettingsRow } from "@/components/settings/SettingsCard"
import { ModelOptions } from "@/components/settings/ModelOptions"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { AdminData, fmtNumber, useAdminData } from "./shared"

const NUMBER_FIELDS = ["free_generations", "default_token_budget", "max_tokens"]

export function PlatformSection() {
  const result = useAdminData(() => adminApi.getSettings())
  return (
    <>
      <SettingsHeader title="Model & limits" description="The built-in model new projects generate with, and how much of it each account gets." />
      <AdminData result={result}>{(data) => <PlatformForm data={data} onSaved={result.setData} />}</AdminData>
    </>
  )
}

function PlatformForm({ data, onSaved }) {
  const { values, defaults, platform_key_configured: keyConfigured } = data
  const [form, setForm] = useState(() => ({ ...values, ...Object.fromEntries(NUMBER_FIELDS.map((k) => [k, String(values[k])])) }))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const payload = { ...form, ...Object.fromEntries(NUMBER_FIELDS.map((k) => [k, parseInt(form[k], 10) || 0])) }
  const dirty = Object.keys(values).some((k) => payload[k] !== values[k])

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const next = await adminApi.updateSettings(payload)
      onSaved(next)
      setMessage({ ok: true, text: "Saved. New turns use these settings right away." })
    } catch (e) {
      setMessage({ ok: false, text: e.message })
    } finally {
      setSaving(false)
    }
  }

  const numberInput = (k) => (
    <BrandInput id={k} inputMode="numeric" value={form[k]} onChange={(e) => set(k, e.target.value.replace(/\D/g, ""))} />
  )
  const envDefault = (k, fmt = fmtNumber) => `Server default: ${fmt(defaults[k])}.`

  return (
    <div className="flex flex-col gap-6">
      {!keyConfigured && (
        <p className="rounded-2xl bg-amber-100 px-4 py-3 text-sm text-amber-900">
          OPENROUTER_API_KEY isn't set on the server, so there is no built-in model. Every user needs their own key.
        </p>
      )}
      <SettingsCard
        title="Built-in model"
        description="Runs each account's free first generations on your OpenRouter key."
        footer={
          <>
            {message && <span className={cn("mr-auto text-sm", message.ok ? "text-emerald-700" : "text-danger")}>{message.text}</span>}
            <BrandButton size="sm" disabled={!dirty || saving} onClick={save}>
              Save changes
            </BrandButton>
          </>
        }
      >
        <SettingsRow label="Built-in model enabled" description="Turn off to pause all free generations (maintenance, or out of credit).">
          <Switch checked={form.platform_enabled} onCheckedChange={(v) => set("platform_enabled", v)} />
        </SettingsRow>
        <SettingsRow label="Default model" description={`OpenRouter model id. Server default: ${defaults.platform_model}.`}>
          <PlatformModelPicker value={form.platform_model} onChange={(v) => set("platform_model", v)} />
        </SettingsRow>
        <SettingsRow label="Max output tokens per call" htmlFor="max_tokens" description={envDefault("max_tokens")}>
          {numberInput("max_tokens")}
        </SettingsRow>
      </SettingsCard>

      <SettingsCard
        title="Default limits per user"
        description="Apply to every account without its own override (set overrides on a user's page)."
        footer={
          <BrandButton size="sm" disabled={!dirty || saving} onClick={save}>
            Save changes
          </BrandButton>
        }
      >
        <SettingsRow label="Free generations" htmlFor="free_generations" description={`Projects each account can generate on the built-in model. ${envDefault("free_generations")}`}>
          {numberInput("free_generations")}
        </SettingsRow>
        <SettingsRow
          label="Token budget"
          htmlFor="default_token_budget"
          description={`Total platform tokens per account (prompt + completion). 0 = unlimited. ${envDefault("default_token_budget")}`}
        >
          {numberInput("default_token_budget")}
        </SettingsRow>
      </SettingsCard>
    </div>
  )
}

function PlatformModelPicker({ value, onChange }) {
  const [provider, setProvider] = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    api.listProviders().then((list) => setProvider(list.find((p) => p.id === "openrouter") ?? null), () => {})
  }, [])

  if (!provider) return <BrandInput value={value} onChange={(e) => onChange(e.target.value)} />

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
          keyStamp="platform"
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
