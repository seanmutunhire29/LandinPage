import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useAccountStore } from "@/store/useAccountStore"
import { UserAvatar } from "@/components/account/UserAvatar"
import { BrandButton } from "@/components/brand/button"
import { BrandInput, BrandTextarea, fieldVariants } from "@/components/brand/field"
import { SettingsCard, SettingsHeader, SettingsRow } from "./SettingsCard"
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
              {error && !usernameError && <p className="mr-auto text-sm text-danger">{error}</p>}
              {saved && !dirty && (
                <span className="mr-auto inline-flex items-center gap-1 text-sm font-medium text-success">
                  <Check className="size-4" /> Saved
                </span>
              )}
              <BrandButton type="button" variant="ghost" disabled={!dirty || saving} onClick={() => setForm(pick(profile))}>
                Cancel
              </BrandButton>
              <BrandButton type="submit" disabled={!dirty || saving}>
                {saving && <Loader2 className="animate-spin" />} Save changes
              </BrandButton>
            </>
          }
        >
          <SettingsRow label="Photo" description="Paste an image URL. Square images look best.">
            <div className="flex items-center gap-3">
              <UserAvatar src={form.avatar_url} initial={initial} className="size-14 text-xl" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <BrandInput value={form.avatar_url} onChange={set("avatar_url")} placeholder="https://..." aria-label="Photo URL" />
                {signInPhoto && form.avatar_url !== signInPhoto && (
                  <button type="button" onClick={() => setForm((f) => ({ ...f, avatar_url: signInPhoto }))} className="self-start text-sm font-semibold text-brand-dark underline-offset-4 hover:underline">
                    Use my sign-in photo
                  </button>
                )}
              </div>
            </div>
          </SettingsRow>
          <SettingsRow label="Display name" htmlFor="display_name">
            <BrandInput id="display_name" value={form.display_name} onChange={set("display_name")} maxLength={80} placeholder="Ada Lovelace" />
          </SettingsRow>
          <SettingsRow label="Username" description="3-30 lowercase letters, numbers or underscores." htmlFor="username">
            <div
              className={cn(
                fieldVariants(),
                "flex items-center pr-0",
                usernameError && "border-destructive has-[input:focus-visible]:border-destructive has-[input:focus-visible]:ring-destructive/15"
              )}
            >
              <span className="text-brand-subtle">@</span>
              <input id="username" value={form.username} onChange={set("username")} maxLength={30} className="h-full min-w-0 flex-1 bg-transparent px-1 outline-none" aria-invalid={usernameError || undefined} />
            </div>
            {usernameError && <p className="mt-1 text-xs text-danger">{error}</p>}
          </SettingsRow>
          <SettingsRow label="Bio" description="A sentence or two for your profile." htmlFor="bio">
            <BrandTextarea id="bio" value={form.bio} onChange={set("bio")} maxLength={BIO_MAX} rows={3} placeholder="I build landing pages for indie SaaS." />
            <p className="mt-1 text-right text-xs text-brand-subtle">
              {form.bio.length}/{BIO_MAX}
            </p>
          </SettingsRow>
          <SettingsRow label="Website" htmlFor="website">
            <BrandInput id="website" value={form.website} onChange={set("website")} placeholder="yoursite.com" />
          </SettingsRow>
          <SettingsRow label="Location" htmlFor="location">
            <BrandInput id="location" value={form.location} onChange={set("location")} maxLength={80} placeholder="Lisbon, Portugal" />
          </SettingsRow>
        </SettingsCard>
      </form>
    </>
  )
}
