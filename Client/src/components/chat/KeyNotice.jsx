import { useState } from "react"
import { Link } from "react-router-dom"
import { ExternalLink, Loader2 } from "lucide-react"
import { useAccountStore } from "@/store/useAccountStore"
import { ProviderTile } from "@/components/account/UserAvatar"

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
    <div role="alert" className="mb-2 rounded-xl bg-gradient-to-br from-[#f1f1ff] to-[#faf8ff] p-3 ring-1 ring-brand/20">
      <div className="flex items-start gap-2.5">
        <ProviderTile provider={provider.id} className="size-7 text-xs" />
        <p className="min-w-0 flex-1 text-[13px] leading-snug text-brand-navy">{message}</p>
      </div>
      <form onSubmit={submit} className="mt-2.5 flex gap-1.5">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`${provider.label} key (${provider.key_hint})`}
          autoComplete="off"
          spellCheck={false}
          className="h-8 min-w-0 flex-1 rounded-md border border-[#d7d9e6] bg-white px-2 font-mono text-[12px] text-brand-navy outline-none placeholder:font-sans placeholder:text-[#9699a6] focus:border-brand/50 focus:ring-2 focus:ring-brand/20"
          aria-label={`${provider.label} API key`}
        />
        <button type="submit" disabled={!value.trim() || busy} className="inline-flex h-8 shrink-0 items-center gap-1 rounded-md bg-brand px-3 text-[12px] font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-50">
          {busy && <Loader2 className="size-3 animate-spin" />}
          {onSaved ? "Save & retry" : "Save key"}
        </button>
      </form>
      {error && <p className="mt-1.5 text-[12px] text-[#b3263e]">{error}</p>}
      <div className="mt-2 flex items-center gap-3 text-[11px] text-[#676879]">
        <a href={provider.key_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-brand">
          Get a {provider.label} key <ExternalLink className="size-3" />
        </a>
        <Link to="/settings/models" className="hover:text-brand">
          Use another provider
        </Link>
      </div>
    </div>
  )
}
