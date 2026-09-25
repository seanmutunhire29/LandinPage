// WebSocket client for /ws/projects/:id. Authenticates with the Supabase token as
// the first message and reconnects with backoff if the connection drops.

import { API_URL } from "@/lib/api"
import { getAccessToken } from "@/store/useAuthStore"

const WS_URL = API_URL.replace(/^http/, "ws")

export function connectAgentSocket(projectId, { onEvent, onStatus }) {
  let ws = null
  let closed = false
  let attempts = 0
  let pingTimer = null
  const outbox = []

  const flush = () => {
    while (ws?.readyState === WebSocket.OPEN && outbox.length) ws.send(JSON.stringify(outbox.shift()))
  }

  async function open() {
    onStatus("connecting")
    const token = await getAccessToken()
    if (closed) return
    ws = new WebSocket(`${WS_URL}/ws/projects/${projectId}`)
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "auth", token }))
    }
    ws.onmessage = (e) => {
      const event = JSON.parse(e.data)
      if (event.type === "ready") {
        attempts = 0
        onStatus("open")
        flush()
        pingTimer = setInterval(() => send({ type: "ping" }), 25_000)
      }
      if (event.type !== "pong") onEvent(event)
    }
    ws.onclose = (e) => {
      clearInterval(pingTimer)
      if (closed) return
      onStatus("closed", e.reason)
      // 4401 unauthorized / 4404 not found: retrying won't help.
      if (e.code === 4401 || e.code === 4404) return onEvent({ type: "error", message: e.reason || "Connection refused" })
      const delay = Math.min(1000 * 2 ** attempts++, 15_000)
      setTimeout(() => !closed && open(), delay)
    }
  }

  function send(msg) {
    // The auth message is always sent first in onopen, so anything after it is safe.
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg))
    else if (msg.type !== "ping") outbox.push(msg)
  }

  open()

  return {
    send,
    close() {
      closed = true
      clearInterval(pingTimer)
      ws?.close()
    },
  }
}
