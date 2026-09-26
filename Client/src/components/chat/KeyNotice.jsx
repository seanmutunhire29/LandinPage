import { useState } from "react"
import { Link } from "react-router-dom"
import { ExternalLink, Loader2 } from "lucide-react"
import { useAccountStore } from "@/store/useAccountStore"
import { ProviderTile } from "@/components/account/UserAvatar"
import { BrandButton } from "@/components/brand/button"
import { BrandInput } from "@/components/brand/field"

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
    <div role="alert" className="mb-2 rounded-2xl bg-secondary p-3 ring-1 ring-brand/20">
      <div className="flex items-start gap-2.5">
        <ProviderTile provider={provider.id} className="size-7 text-xs" />
        <p className="min-w-0 flex-1 text-sm leading-snug text-brand-navy">{message}</p>
      </div>
      <form onSubmit={submit} className="mt-2.5 flex gap-1.5">
        <BrandInput
          size="sm"
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`${provider.label} key (${provider.key_hint})`}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 font-mono text-xs placeholder:font-sans"
          aria-label={`${provider.label} API key`}
        />
        <BrandButton type="submit" size="sm" disabled={!value.trim() || busy}>
          {busy && <Loader2 className="animate-spin" />}
          {onSaved ? "Save & retry" : "Save key"}
        </BrandButton>
      </form>
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      <div className="mt-2 flex items-center gap-3 text-xs text-brand-muted">
        <a href={provider.key_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-brand-dark">
          Get a {provider.label} key <ExternalLink className="size-3" />
        </a>
        <Link to="/settings/models" className="hover:text-brand-dark">
          Use another provider
        </Link>
      </div>
    </div>
  )
}
