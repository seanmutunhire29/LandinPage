import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { hasKey, providerById, useAccountStore } from "@/store/useAccountStore"
import { MessageList } from "./MessageList"
import { ChatInput } from "./ChatInput"
import { ModelPicker } from "./ModelPicker"
import { KeyNotice } from "./KeyNotice"

const basename = (p = "") => p.split("/").pop()
const ACTIVITY = {
  Read: (a) => `reading ${basename(a.file_path)}`,
  Write: (a) => `writing ${basename(a.file_path)}`,
  Edit: (a) => `editing ${basename(a.file_path)}`,
  Bash: (a) => `running ${a.command ?? "a command"}`,
  WebSearch: () => "searching the web",
}

/** Workspace chat: conversation history plus an input for edit instructions. */
export function ChatPanel({ onSend, onRetry }) {
  const messages = useWorkspaceStore((s) => s.messages)
  const streaming = useWorkspaceStore((s) => s.streaming)
  const turnRunning = useWorkspaceStore((s) => s.turnRunning)
  const tools = useWorkspaceStore((s) => s.tools)
  const error = useWorkspaceStore((s) => s.error)
  const connection = useWorkspaceStore((s) => s.connection)
  const errorCode = useWorkspaceStore((s) => s.errorCode)
  const freeAvailable = useWorkspaceStore((s) => s.freeAvailable)
  const settings = useAccountStore((s) => s.settings)
  const provider = useAccountStore((s) => providerById(s.providers, s.settings?.provider))
  // The last message is an unanswered user turn: the server can resume it as-is.
  const running = Object.values(tools).findLast((t) => t.status === "running")
  const activity = !turnRunning ? undefined : running ? (ACTIVITY[running.name]?.(running.args ?? {}) ?? `using ${running.name}`) : streaming ? "replying" : "thinking"
  const canRetry = Boolean(error) && !turnRunning && messages.filter((m) => m.role !== "tool").at(-1)?.role === "user"

  // The next turn needs the user's own key for the selected provider and there isn't a usable one.
  const missingKey = Boolean(provider) && !hasKey(settings, provider.id)
  const keyError = errorCode === "key_required" || errorCode === "platform_depleted"
  const showKeyNotice = Boolean(provider) && !turnRunning && (errorCode === "invalid_key" || (missingKey && (keyError || freeAvailable === false)))
  const keyMessage =
    (keyError || errorCode === "invalid_key") && error
      ? error
      : `Your site's first version is done. Add your own ${provider?.label} API key to keep editing it, or pick another provider from the model menu.`

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-5">
        <MessageList messages={messages} streaming={streaming} working={turnRunning} tools={tools} error={showKeyNotice ? null : error} onRetry={canRetry ? onRetry : undefined} />
      </div>
      <div className="shrink-0 border-t border-border p-3">
        {connection === "closed" && <p className="mb-2 text-xs text-brand-subtle">Reconnecting...</p>}
        {showKeyNotice && <KeyNotice key={provider.id} provider={provider} message={keyMessage} onSaved={canRetry ? onRetry : undefined} />}
        <ChatInput
          onSubmit={onSend}
          busy={turnRunning}
          activity={activity && `LandinPage is ${activity}`}
          placeholder="Describe a change, e.g. make the hero headline bolder"
          toolbar={<ModelPicker />}
        />
      </div>
    </div>
  )
}
