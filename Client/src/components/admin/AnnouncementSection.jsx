import { useState } from "react"
import { adminApi } from "@/lib/api"
import { toast } from "sonner"
import { SettingsCard, SettingsHeader, SettingsRow } from "@/components/settings/SettingsCard"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AnnouncementBar } from "@/components/AnnouncementBanner"
import { AdminData, useAdminData } from "./shared"

const LEVELS = [
  { id: "info", label: "Info" },
  { id: "success", label: "Success" },
  { id: "warning", label: "Warning" },
]

export function AnnouncementSection() {
  const result = useAdminData(() => adminApi.getAnnouncement())
  return (
    <>
      <SettingsHeader title="Announcement" description="A banner shown at the top of every page, for news or planned maintenance." />
      <AdminData result={result}>{(data) => <AnnouncementForm data={data} onSaved={result.setData} />}</AdminData>
    </>
  )
}

function AnnouncementForm({ data, onSaved }) {
  const [form, setForm] = useState(data)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const dirty = form.enabled !== data.enabled || form.message !== data.message || form.level !== data.level

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const next = await adminApi.updateAnnouncement(form)
      setForm(next)
      onSaved(next)
      toast.success(next.enabled && next.message ? "Live for everyone." : "Saved. The banner is hidden.")
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsCard
      title="Site banner"
      footer={
        <>
          {error && <span className="mr-auto text-sm text-destructive">{error}</span>}
          <Button size="sm" disabled={!dirty || saving || (form.enabled && !form.message.trim())} onClick={save}>
            Save
          </Button>
        </>
      }
    >
      <SettingsRow label="Show banner">
        <Switch checked={form.enabled} onCheckedChange={(v) => set("enabled", v)} />
      </SettingsRow>
      <SettingsRow label="Style">
        <ToggleGroup type="single" variant="outline" spacing={0} value={form.level} onValueChange={(v) => v && set("level", v)} aria-label="Banner style">
          {LEVELS.map((l) => (
            <ToggleGroupItem key={l.id} value={l.id} className="px-3">
              {l.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </SettingsRow>
      <SettingsRow label="Message" htmlFor="announcement-message" description={`${form.message.length}/500`}>
        <Textarea id="announcement-message" rows={3} maxLength={500} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="We're rolling out a new model today..." />
      </SettingsRow>
      <div className="py-5">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">Preview</p>
        {form.message.trim() ? (
          <AnnouncementBar level={form.level} message={form.message} className="rounded-lg" />
        ) : (
          <p className="text-sm text-muted-foreground">Write a message to preview it.</p>
        )}
      </div>
    </SettingsCard>
  )
}
