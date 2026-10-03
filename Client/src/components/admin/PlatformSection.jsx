import { useState } from "react"
import { Info, KeyRound } from "lucide-react"
import { toast } from "sonner"
import { adminApi } from "@/lib/api"
import { SettingsCard, SettingsHeader, SettingsRow } from "@/components/settings/SettingsCard"
import { ModelCombobox } from "@/components/settings/ModelOptions"
import { KeyRow } from "@/components/settings/ModelsSection"
import { ProviderChoice } from "@/components/settings/ProviderChoice"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
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
  const [error, setError] = useState(null)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const provider = providers.find((p) => p.id === form.platform_provider) ?? providers[0]
  const payload = { ...form, ...Object.fromEntries(NUMBER_FIELDS.map((k) => [k, parseInt(form[k], 10) || 0])) }
  const dirty = Object.keys(values).some((k) => payload[k] !== values[k])

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const next = await adminApi.updateSettings(payload)
      onSaved(next)
      setForm((f) => ({ ...f, platform_model: next.values.platform_model }))
      toast.success("Saved. New turns use these settings right away.")
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  const saveButton = (
    <>
      {error && <span className="mr-auto text-sm text-destructive">{error}</span>}
      <Button size="sm" disabled={!dirty || saving} onClick={save}>
        Save changes
      </Button>
    </>
  )
  const numberInput = (k) => <Input id={k} inputMode="numeric" value={form[k]} onChange={(e) => set(k, e.target.value.replace(/\D/g, ""))} />
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
          <p className="mb-3 text-sm font-medium">Provider</p>
          <ProviderChoice
            providers={providers}
            activeId={provider.id}
            isConnected={(id) => !!keys[id]}
            onChoose={(p) => p.id !== provider.id && setForm((f) => ({ ...f, platform_provider: p.id, platform_model: p.default_model }))}
          />
        </div>
        <SettingsRow label="Model" description={provider.notes || `Any chat model ${provider.label} offers. Server default: ${defaults.platform_model}.`}>
          <ModelCombobox
            provider={provider}
            value={form.platform_model}
            keyStamp={`platform:${selectedKey?.last4 ?? ""}`}
            fetchModels={adminApi.platformModels}
            onSelect={(v) => set("platform_model", v)}
          />
        </SettingsRow>
        <SettingsRow label="Max output tokens per call" htmlFor="max_tokens" description={envDefault("max_tokens")}>
          {numberInput("max_tokens")}
        </SettingsRow>
        {!selectedKey && (
          <div className="py-5">
            <Alert variant="warning">
              <Info />
              <AlertDescription>Add a {provider.label} key below, or free generations won't run and everyone will need their own key.</AlertDescription>
            </Alert>
          </div>
        )}
      </SettingsCard>

      <SettingsCard
        title="Built-in model keys"
        description="Your keys pay for everyone's free generations. They're encrypted on the server and never shown again after saving. Only the selected provider's key is used."
        action={<KeyRound className="size-5 text-muted-foreground" />}
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
