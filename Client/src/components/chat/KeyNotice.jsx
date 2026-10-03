import { useState } from "react"
import { Link } from "react-router-dom"
import { ExternalLink, KeyRound, Loader2 } from "lucide-react"
import { useAccountStore } from "@/store/useAccountStore"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/**
 * Shown when the next turn needs the user's own key: after the free first
 * generation, or when a saved key stopped working. The key can be pasted right
 * here; saving it retries the pending message.
 */
export function KeyNotice({ provider, message, onSaved }) {
  const saveKey = useAccountStore((s) => s.saveKey)
  const [value, setValue] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    if (!value.trim()) return
    setBusy(true)
    setError(null)
    try {
      await saveKey(provider.id, value.trim())
      setValue("")
      onSaved?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Alert variant="warning" className="mb-2">
      <KeyRound />
      <AlertDescription>
        <p className="leading-snug text-foreground">{message}</p>
        <form onSubmit={submit} className="mt-2.5 flex w-full gap-1.5">
          <Input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`${provider.label} key (${provider.key_hint})`}
            autoComplete="off"
            spellCheck={false}
            className="h-7 min-w-0 flex-1 font-mono text-xs placeholder:font-sans md:text-xs"
            aria-label={`${provider.label} API key`}
          />
          <Button type="submit" size="sm" disabled={!value.trim() || busy}>
            {busy && <Loader2 className="animate-spin" />}
            {onSaved ? "Save & retry" : "Save key"}
          </Button>
        </form>
        {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <a href={provider.key_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-sm outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
            Get a {provider.label} key <ExternalLink className="size-3" />
          </a>
          <Link to="/settings/models" className="rounded-sm outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
            Use another provider
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  )
}
