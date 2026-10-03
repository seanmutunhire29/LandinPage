import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuthStore } from "@/store/useAuthStore"
import { useAccountStore } from "@/store/useAccountStore"
import { UserAvatar } from "@/components/account/UserAvatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"
import { SettingsCard, SettingsHeader, SettingsRow } from "./SettingsCard"

const FIELDS = ["display_name", "username", "bio", "avatar_url", "website", "location"]
const BIO_MAX = 160
const pick = (p) => Object.fromEntries(FIELDS.map((f) => [f, p?.[f] ?? ""]))

export function ProfileSection() {
  const profile = useAccountStore((s) => s.profile)
  const updateProfile = useAccountStore((s) => s.updateProfile)
  const signInPhoto = useAuthStore((s) => s.user?.user_metadata?.avatar_url)
  const [form, setForm] = useState(() => pick(profile))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const dirty = FIELDS.some((f) => (form[f] ?? "") !== (profile[f] ?? ""))
  const set = (field) => (e) => {
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
      toast.success("Saved")
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
              {error && !usernameError && <p className="mr-auto text-sm text-destructive">{error}</p>}
              <Button type="button" variant="ghost" disabled={!dirty || saving} onClick={() => setForm(pick(profile))}>
                Cancel
              </Button>
              <Button type="submit" disabled={!dirty || saving}>
                {saving && <Loader2 className="animate-spin" />} Save changes
              </Button>
            </>
          }
        >
          <SettingsRow label="Photo" description="Paste an image URL. Square images look best.">
            <div className="flex items-center gap-3">
              <UserAvatar src={form.avatar_url} initial={initial} className="size-14 text-xl" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Input value={form.avatar_url} onChange={set("avatar_url")} placeholder="https://..." aria-label="Photo URL" />
                {signInPhoto && form.avatar_url !== signInPhoto && (
                  <Button type="button" variant="link" size="sm" onClick={() => setForm((f) => ({ ...f, avatar_url: signInPhoto }))} className="h-auto self-start px-0">
                    Use my sign-in photo
                  </Button>
                )}
              </div>
            </div>
          </SettingsRow>
          <SettingsRow label="Display name" htmlFor="display_name">
            <Input id="display_name" value={form.display_name} onChange={set("display_name")} maxLength={80} placeholder="Ada Lovelace" />
          </SettingsRow>
          <SettingsRow label="Username" description="3-30 lowercase letters, numbers or underscores." htmlFor="username">
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>@</InputGroupText>
              </InputGroupAddon>
              <InputGroupInput id="username" value={form.username} onChange={set("username")} maxLength={30} aria-invalid={usernameError || undefined} />
            </InputGroup>
            {usernameError && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
          </SettingsRow>
          <SettingsRow label="Bio" description="A sentence or two for your profile." htmlFor="bio">
            <Textarea id="bio" value={form.bio} onChange={set("bio")} maxLength={BIO_MAX} rows={3} placeholder="I build landing pages for indie SaaS." />
            <p className="mt-1.5 text-right text-xs text-muted-foreground">
              {form.bio.length}/{BIO_MAX}
            </p>
          </SettingsRow>
          <SettingsRow label="Website" htmlFor="website">
            <Input id="website" value={form.website} onChange={set("website")} placeholder="yoursite.com" />
          </SettingsRow>
          <SettingsRow label="Location" htmlFor="location">
            <Input id="location" value={form.location} onChange={set("location")} maxLength={80} placeholder="Lisbon, Portugal" />
          </SettingsRow>
        </SettingsCard>
      </form>
    </>
  )
}
