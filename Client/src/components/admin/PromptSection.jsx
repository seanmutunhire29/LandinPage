import { useState } from "react"
import { RotateCcw } from "lucide-react"
import { adminApi } from "@/lib/api"
import { BrandButton } from "@/components/brand/button"
import { BrandTextarea } from "@/components/brand/field"
import { SettingsCard, SettingsHeader } from "@/components/settings/SettingsCard"
import { cn } from "@/lib/utils"
import { AdminData, Pill, useAdminData } from "./shared"

export function PromptSection() {
  const result = useAdminData(() => adminApi.getSystemPrompt())
  return (
    <>
      <SettingsHeader
        title="System prompt"
        description="The build agent's instructions. The project's file list and design spec are appended automatically on every turn."
      />
      <AdminData result={result}>{(data) => <PromptEditor data={data} onSaved={result.setData} />}</AdminData>
    </>
  )
}

function PromptEditor({ data, onSaved }) {
  const [text, setText] = useState(data.prompt)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState(null)
  const dirty = text !== data.prompt

  const run = async (fn, ok) => {
    setBusy(true)
    setMessage(null)
    try {
      const next = await fn()
      setText(next.prompt)
      onSaved(next)
      setMessage({ ok: true, text: ok })
    } catch (e) {
      setMessage({ ok: false, text: e.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <SettingsCard
      title="Agent instructions"
      action={data.customized ? <Pill tone="brand">Customized</Pill> : <Pill>Built-in default</Pill>}
      footer={
        <>
          {message ? (
            <span className={cn("mr-auto text-sm", message.ok ? "text-emerald-700" : "text-danger")}>{message.text}</span>
          ) : (
            <span className="mr-auto text-xs text-brand-subtle">{text.length.toLocaleString()} characters · previous versions are kept in the audit log</span>
          )}
          {dirty && (
            <BrandButton variant="ghost" size="sm" disabled={busy} onClick={() => setText(data.prompt)}>
              Discard
            </BrandButton>
          )}
          <BrandButton
            variant="ghost"
            size="sm"
            disabled={busy || !data.customized}
            onClick={() => window.confirm("Reset to the built-in prompt?") && run(() => adminApi.resetSystemPrompt(), "Reset to the built-in prompt.")}
          >
            <RotateCcw /> Reset to default
          </BrandButton>
          <BrandButton size="sm" disabled={busy || !dirty || text.trim().length < 20} onClick={() => run(() => adminApi.updateSystemPrompt(text), "Saved. New turns use this prompt.")}>
            Save prompt
          </BrandButton>
        </>
      }
    >
      <div className="py-5">
        <BrandTextarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} className="h-[60vh] resize-y font-mono text-xs leading-relaxed" />
      </div>
    </SettingsCard>
  )
}
