import { useState } from "react"
import { ExternalLink, Eye, EyeOff, Info, KeyRound, Loader2, Sparkles } from "lucide-react"
import { hasKey, providerById, useAccountStore } from "@/store/useAccountStore"
import { ProviderTile } from "@/components/account/UserAvatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Progress } from "@/components/ui/progress"
import { ModelCombobox } from "./ModelOptions"
import { ProviderChoice } from "./ProviderChoice"
import { SettingsCard, SettingsHeader, SettingsRow } from "./SettingsCard"
import { shortModel } from "@/lib/providers"

/** One provider's API key: status, add/replace form, and remove (when `onDelete` is given). */
export function KeyRow({ provider, saved, onSave, onDelete, note }) {
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
          <p className="text-sm font-medium">{provider.label}</p>
          <a href={provider.key_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-sm text-sm text-muted-foreground underline-offset-4 outline-none hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50">
            Get a key <ExternalLink className="size-3" />
          </a>
        </div>
        {saved ? (
          <Badge variant="success" className="font-mono">
            <span className="size-1.5 rounded-full bg-success" />
            {saved.last4 ? `•••• ${saved.last4}` : "Connected"}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            Not connected
          </Badge>
        )}
        {!editing && (
          <div className="flex gap-1.5">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
              {saved ? "Replace" : "Add key"}
            </Button>
            {saved && onDelete && (
              <Button type="button" variant="destructive" size="sm" disabled={busy === "delete"} onClick={() => run("delete", () => onDelete(provider.id))}>
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
            if (value.trim()) run("save", () => onSave(provider.id, value.trim()))
          }}
          className="mt-4 flex flex-wrap items-center gap-2 sm:pl-11"
        >
          <InputGroup className="min-w-0 flex-1 basis-56">
            <InputGroupInput
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={provider.key_hint}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              className="font-mono text-sm placeholder:font-sans"
              aria-label={`${provider.label} API key`}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide key" : "Show key"}>
                {show ? <EyeOff /> : <Eye />}
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <Button type="submit" disabled={!value.trim() || busy === "save"}>
            {busy === "save" ? (
              <>
                <Loader2 className="animate-spin" /> Checking
              </>
            ) : (
              "Save key"
            )}
          </Button>
          <Button type="button" variant="ghost" onClick={() => {
              setEditing(false)
              setValue("")
              setError(null)
            }}>
            Cancel
          </Button>
        </form>
      )}
      {note && <p className="mt-2 text-xs text-muted-foreground sm:pl-11">{note}</p>}
      {error && <p className="mt-2 text-xs text-destructive sm:pl-11">{error}</p>}
    </div>
  )
}

export function ModelsSection() {
  const settings = useAccountStore((s) => s.settings)
  const providers = useAccountStore((s) => s.providers)
  const selectModel = useAccountStore((s) => s.selectModel)
  const saveKey = useAccountStore((s) => s.saveKey)
  const deleteKey = useAccountStore((s) => s.deleteKey)
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
        <Card>
          <CardContent className="flex items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
              <Sparkles className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold">
                {free.limit === 0 ? "Bring your own key" : `${freeLeft} of ${free.limit} free generation${free.limit === 1 ? "" : "s"} left`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {free.limit === 0
                  ? "Generation and edits run on your own provider key."
                  : `The first version of each new site is on us, built with ${shortModel(settings.platform_model)}. Edits after that use your own key and the model you pick below.`}
              </p>
              {free.limit > 0 && (
                <Progress value={Math.min(100, (free.used / free.limit) * 100)} aria-label="Free generations used" className="mt-3 h-1.5" />
              )}
            </div>
          </CardContent>
        </Card>

        <SettingsCard title="Default model" description="Used for edits in every project. You can also switch it from the chat box.">
          <div className="py-5">
            <ProviderChoice
              providers={providers}
              activeId={settings.provider}
              isConnected={(id) => hasKey(settings, id)}
              onChoose={(p) => p.id !== settings.provider && choose(p.id, p.default_model)}
            />
          </div>
          {provider && (
            <SettingsRow label="Model" description={provider.notes || `Any chat model ${provider.label} offers. Pick from the list or type an id.`}>
              <ModelCombobox
                provider={provider}
                value={settings.model}
                keyStamp={settings.keys.find((k) => k.provider === provider.id)?.updated_at}
                onSelect={(model) => choose(provider.id, model)}
              />
            </SettingsRow>
          )}
          {provider && !hasKey(settings, provider.id) && (
            <div className="py-5">
              <Alert variant="warning">
                <Info />
                <AlertDescription>Add a {provider.label} key below to edit your sites with this model.</AlertDescription>
              </Alert>
            </div>
          )}
          {error && <p className="py-3 text-sm text-destructive">{error}</p>}
        </SettingsCard>

        <SettingsCard
          title="API keys"
          description="Keys are encrypted on our server and only used for your own requests. We never show them again after saving."
          action={<KeyRound className="size-5 text-muted-foreground" />}
        >
          {providers.map((p) => (
            <KeyRow key={p.id} provider={p} saved={settings.keys.find((k) => k.provider === p.id)} onSave={saveKey} onDelete={deleteKey} />
          ))}
        </SettingsCard>
      </div>
    </>
  )
}
