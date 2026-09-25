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
}
