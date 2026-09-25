import { useCallback, useEffect, useRef } from "react"
import { api } from "@/lib/api"
import { connectAgentSocket } from "@/lib/agentSocket"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { applyFile, cancelCommand, runAgentCommand, startProject } from "@/webcontainer/runtime"

const SAVE_DEBOUNCE_MS = 600

/**
 * Opens a project: loads it from the API (Supabase is the source of truth),
 * mounts it into a fresh WebContainer, and connects the agent socket.
 */
export function useProjectSession(projectId) {
  const socket = useRef(null)
  const saveTimers = useRef({})

  useEffect(() => {
    const s = useWorkspaceStore.getState()
    s.reset()
    let cancelled = false

    const persist = (path, content) => socket.current?.send({ type: "file_save", path, content })

    const onEvent = (e) => {
      const st = useWorkspaceStore.getState()
      switch (e.type) {
        case "ready":
          if (e.pending) socket.current.send({ type: "resume" })
          break
        case "user_message":
          st.addMessage(e.message)
          break
        case "turn_start":
          useWorkspaceStore.setState({ turnRunning: true, streaming: "", error: null })
          break
        case "token":
          st.appendToken(e.text)
          break
        case "assistant_message":
          st.addMessage(e.message)
          useWorkspaceStore.setState({ streaming: "" })
          break
        case "tool_start":
          st.toolStart(e)
          break
        case "tool_result":
          st.toolResult(e)
          break
        case "file_write":
          st.setFile(e.path, e.content)
          applyFile(e.path, e.content)
          break
        case "command":
          runAgentCommand(e.id, e.command, (path, content) => {
            useWorkspaceStore.getState().setFile(path, content)
            persist(path, content)
          }).then((result) => socket.current?.send({ type: "command_result", id: e.id, ...result }))
          break
        case "command_cancel":
          cancelCommand(e.id)
          break
        case "turn_done":
          useWorkspaceStore.setState({ turnRunning: false, streaming: "" })
          break
        case "error":
          useWorkspaceStore.setState({ error: e.message })
          break
      }
    }

    api
      .getProject(projectId)
      .then((data) => {
        if (cancelled) return
        useWorkspaceStore.getState().load(data)
        startProject(projectId, useWorkspaceStore.getState().files)
        socket.current = connectAgentSocket(projectId, {
          onEvent,
          onStatus: (connection) => useWorkspaceStore.setState({ connection }),
        })
      })
      .catch((err) => !cancelled && useWorkspaceStore.setState({ error: err.message, runtime: { status: "error", error: err.message } }))

    const timers = saveTimers.current
    return () => {
      cancelled = true
      socket.current?.close()
      socket.current = null
      Object.values(timers).forEach(clearTimeout)
    }
  }, [projectId])

  const sendChat = useCallback((content) => {
    socket.current?.send({ type: "chat", content })
  }, [])

  const retry = useCallback(() => {
    useWorkspaceStore.setState({ error: null })
    socket.current?.send({ type: "resume" })
  }, [])

  /** Editor edits: update store now, container and database after a short pause. */
  const editFile = useCallback((path, content) => {
    useWorkspaceStore.getState().setFile(path, content)
    clearTimeout(saveTimers.current[path])
    saveTimers.current[path] = setTimeout(() => {
      applyFile(path, content)
      socket.current?.send({ type: "file_save", path, content })
    }, SAVE_DEBOUNCE_MS)
  }, [])

  return { sendChat, retry, editFile }
}
