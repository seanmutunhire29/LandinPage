import { useState } from "react"
import { RotateCcw } from "lucide-react"
import { toast } from "sonner"
import { adminApi } from "@/lib/api"
import { SettingsCard, SettingsHeader } from "@/components/settings/SettingsCard"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
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
  const [error, setError] = useState(null)
  const dirty = text !== data.prompt

  const run = async (fn, ok) => {
    setBusy(true)
    setError(null)
    try {
      const next = await fn()
      setText(next.prompt)
      onSaved(next)
      toast.success(ok)
    } catch (e) {
      setError(e.message)
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
          {error ? (
            <span className="mr-auto text-sm text-destructive">{error}</span>
          ) : (
            <span className="mr-auto text-xs text-muted-foreground">{text.length.toLocaleString()} characters · previous versions are kept in the audit log</span>
          )}
          {dirty && (
            <Button variant="ghost" size="sm" disabled={busy} onClick={() => setText(data.prompt)}>
              Discard
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" disabled={busy || !data.customized}>
                <RotateCcw /> Reset to default
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset to the built-in prompt?</AlertDialogTitle>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => run(() => adminApi.resetSystemPrompt(), "Reset to the built-in prompt.")}>Reset</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button size="sm" disabled={busy || !dirty || text.trim().length < 20} onClick={() => run(() => adminApi.updateSystemPrompt(text), "Saved. New turns use this prompt.")}>
            Save prompt
          </Button>
        </>
      }
    >
      <div className="py-5">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} spellCheck={false} className="h-[60vh] resize-y font-mono text-xs leading-relaxed" />
      </div>
    </SettingsCard>
  )
}
