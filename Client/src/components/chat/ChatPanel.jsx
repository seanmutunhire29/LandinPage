import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { MessageList } from "./MessageList"
import { ChatInput } from "./ChatInput"

/** Workspace chat: conversation history plus an input for edit instructions. */
export function ChatPanel({ onSend, onRetry }) {
  const messages = useWorkspaceStore((s) => s.messages)
  const streaming = useWorkspaceStore((s) => s.streaming)
  const turnRunning = useWorkspaceStore((s) => s.turnRunning)
  const tools = useWorkspaceStore((s) => s.tools)
  const error = useWorkspaceStore((s) => s.error)
  const connection = useWorkspaceStore((s) => s.connection)
  // The last message is an unanswered user turn: the server can resume it as-is.
  const canRetry = Boolean(error) && !turnRunning && messages.filter((m) => m.role !== "tool").at(-1)?.role === "user"

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-5">
        <MessageList messages={messages} streaming={streaming} working={turnRunning} tools={tools} error={error} onRetry={canRetry ? onRetry : undefined} />
      </div>
      <div className="shrink-0 border-t border-[#e3e5f0] p-3">
        {connection === "closed" && <p className="mb-2 text-xs text-[#9699a6]">Reconnecting...</p>}
        <ChatInput onSubmit={onSend} busy={turnRunning} placeholder="Describe a change, e.g. make the hero headline bolder" />
      </div>
    </div>
  )
}
