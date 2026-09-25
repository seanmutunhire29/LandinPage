import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { MessageList } from "./MessageList"
import { ChatInput } from "./ChatInput"

/** Workspace chat: conversation history plus an input for edit instructions. */
export function ChatPanel({ onSend }) {
  const messages = useWorkspaceStore((s) => s.messages)
  const streaming = useWorkspaceStore((s) => s.streaming)
  const turnRunning = useWorkspaceStore((s) => s.turnRunning)
  const tools = useWorkspaceStore((s) => s.tools)
  const error = useWorkspaceStore((s) => s.error)
  const connection = useWorkspaceStore((s) => s.connection)

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        <MessageList messages={messages} streaming={streaming} working={turnRunning} tools={tools} error={error} />
      </div>
      <div className="shrink-0 border-t border-[#e3e5f0] p-3">
        {connection === "closed" && <p className="mb-2 text-xs text-[#9699a6]">Reconnecting...</p>}
        <ChatInput onSubmit={onSend} busy={turnRunning} placeholder="Describe a change, e.g. make the hero headline bolder" />
      </div>
    </div>
  )
}
