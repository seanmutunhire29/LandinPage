import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useAccountStore } from "@/store/useAccountStore"
import { UserAvatar } from "@/components/account/UserAvatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SettingsCard, SettingsHeader, SettingsRow, fieldClass } from "./SettingsCard"
import { cn } from "@/lib/utils"

const FIELDS = ["display_name", "username", "bio", "avatar_url", "website", "location"]
const BIO_MAX = 160
const pick = (p) => Object.fromEntries(FIELDS.map((f) => [f, p?.[f] ?? ""]))

export function ProfileSection() {
  const profile = useAccountStore((s) => s.profile)
  const updateProfile = useAccountStore((s) => s.updateProfile)
  const signInPhoto = useAuthStore((s) => s.user?.user_metadata?.avatar_url)
  const [form, setForm] = useState(() => pick(profile))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const dirty = FIELDS.some((f) => (form[f] ?? "") !== (profile[f] ?? ""))
  const set = (field) => (e) => {
    setSaved(false)
    setError(null)
    setForm((f) => ({ ...f, [field]: field === "username" ? e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") : e.target.value }))
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const changed = Object.fromEntries(FIELDS.filter((f) => form[f] !== (profile[f] ?? "")).map((f) => [f, form[f]]))
      await updateProfile(changed)
      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const usernameError = error && /username/i.test(error)
  const initial = (form.display_name || form.username || "?").trim()[0]?.toUpperCase()

  return (
    <>
      <SettingsHeader title="Profile" description="How you appear across LandinPage." />
      <form onSubmit={save}>
        <SettingsCard
          title="Public profile"
          description="Your name, handle and a little about you."
          footer={
            <>
              {error && !usernameError && <p className="mr-auto text-sm text-[#b3263e]">{error}</p>}
              {saved && !dirty && (
                <span className="mr-auto inline-flex items-center gap-1 text-sm font-medium text-[#00854b]">
                  <Check className="size-4" /> Saved
                </span>
              )}
              <Button type="button" variant="ghost" disabled={!dirty || saving} onClick={() => setForm(pick(profile))}>
                Cancel
              </Button>
              <Button type="submit" disabled={!dirty || saving} className="bg-brand px-4 text-white hover:bg-brand-dark">
                {saving && <Loader2 className="animate-spin" data-icon="inline-start" />} Save changes
              </Button>
            </>
          }
        >
          <SettingsRow label="Photo" description="Paste an image URL. Square images look best.">
            <div className="flex items-center gap-3">
              <UserAvatar src={form.avatar_url} initial={initial} className="size-12 text-lg" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Input value={form.avatar_url} onChange={set("avatar_url")} placeholder="https://..." className={fieldClass} aria-label="Photo URL" />
                {signInPhoto && form.avatar_url !== signInPhoto && (
                  <button type="button" onClick={() => setForm((f) => ({ ...f, avatar_url: signInPhoto }))} className="self-start text-xs font-medium text-brand hover:underline">
                    Use my sign-in photo
                  </button>
                )}
              </div>
            </div>
          </SettingsRow>
          <SettingsRow label="Display name" htmlFor="display_name">
            <Input id="display_name" value={form.display_name} onChange={set("display_name")} maxLength={80} placeholder="Ada Lovelace" className={fieldClass} />
          </SettingsRow>
          <SettingsRow label="Username" description="3-30 lowercase letters, numbers or underscores." htmlFor="username">
            <div className={cn("flex h-9 items-center rounded-lg border bg-white pl-2.5 text-sm focus-within:ring-3", usernameError ? "border-destructive focus-within:ring-destructive/20" : "border-[#d7d9e6] focus-within:border-ring focus-within:ring-ring/50")}>
              <span className="text-[#9699a6]">@</span>
              <input id="username" value={form.username} onChange={set("username")} maxLength={30} className="h-full min-w-0 flex-1 bg-transparent px-1 text-brand-navy outline-none" aria-invalid={usernameError || undefined} />
            </div>
            {usernameError && <p className="mt-1 text-xs text-[#b3263e]">{error}</p>}
          </SettingsRow>
          <SettingsRow label="Bio" description="A sentence or two for your profile." htmlFor="bio">
            <textarea
              id="bio"
              value={form.bio}
              onChange={set("bio")}
              maxLength={BIO_MAX}
              rows={3}
              placeholder="I build landing pages for indie SaaS."
              className="block w-full resize-none rounded-lg border border-[#d7d9e6] bg-white px-2.5 py-2 text-sm text-brand-navy outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
            <p className="mt-1 text-right text-[11px] text-[#9699a6]">
              {form.bio.length}/{BIO_MAX}
            </p>
          </SettingsRow>
          <SettingsRow label="Website" htmlFor="website">
            <Input id="website" value={form.website} onChange={set("website")} placeholder="yoursite.com" className={fieldClass} />
          </SettingsRow>
          <SettingsRow label="Location" htmlFor="location">
            <Input id="location" value={form.location} onChange={set("location")} maxLength={80} placeholder="Lisbon, Portugal" className={fieldClass} />
          </SettingsRow>
        </SettingsCard>
      </form>
    </>
  )
}
