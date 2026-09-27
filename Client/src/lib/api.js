import { getAccessToken } from "@/store/useAuthStore"

export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "")

async function request(path, { method = "GET", body } = {}) {
  const token = await getAccessToken()
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const detail = await res.json().then((j) => j.detail).catch(() => res.statusText)
    throw new Error(typeof detail === "string" ? detail : `Request failed (${res.status})`)
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  listProjects: () => request("/projects"),
  createProject: (body) => request("/projects", { method: "POST", body }),
  getProject: (id) => request(`/projects/${id}`),

  getProfile: () => request("/me/profile"),
  updateProfile: (body) => request("/me/profile", { method: "PATCH", body }),
  getSettings: () => request("/me/settings"),
  updateSettings: (body) => request("/me/settings", { method: "PATCH", body }),
  saveKey: (provider, apiKey) => request(`/me/keys/${provider}`, { method: "PUT", body: { api_key: apiKey } }),
  deleteKey: (provider) => request(`/me/keys/${provider}`, { method: "DELETE" }),
  listProviders: () => request("/providers"),
  listModels: (provider) => request(`/providers/${provider}/models`),

  getAnnouncement: () => request("/announcement"),
}

const qs = (params) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""))
  return q.size ? `?${q}` : ""
}

/** Admin dashboard endpoints; the server rejects non-admins with 403. */
export const adminApi = {
  listUsers: ({ search, page } = {}) => request(`/admin/users${qs({ search, page })}`),
  getUser: (id) => request(`/admin/users/${id}`),
  updateUser: (id, body) => request(`/admin/users/${id}`, { method: "PATCH", body }),
  suspendUser: (id, reason) => request(`/admin/users/${id}/suspend`, { method: "POST", body: { reason } }),
  unsuspendUser: (id) => request(`/admin/users/${id}/unsuspend`, { method: "POST" }),
  setRole: (id, admin) => request(`/admin/users/${id}/role`, { method: "POST", body: { admin } }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: "DELETE" }),
  getProject: (id) => request(`/admin/projects/${id}`),
  stats: (days) => request(`/admin/stats${qs({ days })}`),
  getSettings: () => request("/admin/settings"),
  updateSettings: (body) => request("/admin/settings", { method: "PUT", body }),
  getSystemPrompt: () => request("/admin/system-prompt"),
  updateSystemPrompt: (prompt) => request("/admin/system-prompt", { method: "PUT", body: { prompt } }),
  resetSystemPrompt: () => request("/admin/system-prompt", { method: "DELETE" }),
  getAnnouncement: () => request("/admin/announcement"),
  updateAnnouncement: (body) => request("/admin/announcement", { method: "PUT", body }),
  audit: (page) => request(`/admin/audit${qs({ page })}`),
}
