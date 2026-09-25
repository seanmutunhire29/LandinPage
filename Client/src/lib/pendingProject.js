// The first chat message is typed before the user has an account. We stash it
// (with the spec) in localStorage so it survives the OAuth / email-confirmation
// redirect, then create the project once a session exists.

import { api } from "@/lib/api"

const KEY = "landinpage-pending-project"

export function savePending(firstMessage, designSpec) {
  localStorage.setItem(KEY, JSON.stringify({ firstMessage, designSpec, savedAt: Date.now() }))
}

export function peekPending() {
  try {
    return JSON.parse(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

export const clearPending = () => localStorage.removeItem(KEY)

let inFlight = null

/**
 * Create the project from the stashed message, exactly once even if called
 * concurrently (React StrictMode double effects, or dialog + callback racing).
 * Resolves to the new project, or null if nothing was pending.
 */
export function createPendingProject() {
  if (inFlight) return inFlight
  const pending = peekPending()
  if (!pending?.firstMessage || !pending?.designSpec) return Promise.resolve(null)
  inFlight = api
    .createProject({ first_message: pending.firstMessage, design_spec: pending.designSpec })
    .then((project) => {
      clearPending()
      return project
    })
    .finally(() => {
      inFlight = null
    })
  return inFlight
}
