import { useState } from "react"
import { adminApi } from "@/lib/api"
import { BrandButton } from "@/components/brand/button"
import { BrandTextarea } from "@/components/brand/field"
import { Segmented } from "@/components/brand/segmented"
import { SettingsCard, SettingsHeader, SettingsRow } from "@/components/settings/SettingsCard"
import { Switch } from "@/components/ui/switch"
import { AnnouncementBar } from "@/components/AnnouncementBanner"
import { cn } from "@/lib/utils"
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
  const [message, setMessage] = useState(null)
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const dirty = form.enabled !== data.enabled || form.message !== data.message || form.level !== data.level

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const next = await adminApi.updateAnnouncement(form)
      setForm(next)
      onSaved(next)
      setMessage({ ok: true, text: next.enabled && next.message ? "Live for everyone." : "Saved. The banner is hidden." })
    } catch (e) {
      setMessage({ ok: false, text: e.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsCard
      title="Site banner"
      footer={
        <>
          {message && <span className={cn("mr-auto text-sm", message.ok ? "text-emerald-700" : "text-danger")}>{message.text}</span>}
          <BrandButton size="sm" disabled={!dirty || saving || (form.enabled && !form.message.trim())} onClick={save}>
            Save
          </BrandButton>
        </>
      }
    >
      <SettingsRow label="Show banner">
        <Switch checked={form.enabled} onCheckedChange={(v) => set("enabled", v)} />
      </SettingsRow>
      <SettingsRow label="Style">
        <Segmented options={LEVELS} value={form.level} onChange={(v) => set("level", v)} label="Banner style" />
      </SettingsRow>
      <SettingsRow label="Message" description={`${form.message.length}/500`}>
        <BrandTextarea rows={3} maxLength={500} value={form.message} onChange={(e) => set("message", e.target.value)} placeholder="We're rolling out a new model today..." />
      </SettingsRow>
      <div className="py-5">
        <p className="mb-2 text-xs font-semibold text-brand-subtle">Preview</p>
        {form.message.trim() ? (
          <AnnouncementBar level={form.level} message={form.message} className="rounded-2xl" />
        ) : (
          <p className="text-sm text-brand-subtle">Write a message to preview it.</p>
        )}
      </div>
    </SettingsCard>
  )
}
