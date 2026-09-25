import { create } from "zustand"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/useAuthStore"

/** Profile, model settings and saved-key status for the signed-in user. Plaintext keys never land here. */
export const useAccountStore = create((set, get) => ({
  profile: null,
  settings: null, // { provider, model, free_generations: { used, limit }, platform_model, keys: [{ provider, last4, updated_at }] }
  providers: [],
  status: "idle", // idle | loading | ready | error
  error: null,

  load: async () => {
    if (get().status === "loading") return
    set({ status: "loading", error: null })
    try {
      const [profile, settings, providers] = await Promise.all([api.getProfile(), api.getSettings(), api.listProviders()])
      set({ profile, settings, providers, status: "ready" })
    } catch (err) {
      set({ status: "error", error: err.message })
    }
  },

  updateProfile: async (fields) => {
    const profile = await api.updateProfile(fields)
    set({ profile })
    return profile
  },

  /** Optimistic: the picker updates at once and rolls back if the server refuses. */
  selectModel: async (provider, model) => {
    const prev = get().settings
    set({ settings: { ...prev, provider, model } })
    try {
      set({ settings: await api.updateSettings({ provider, model }) })
    } catch (err) {
      set({ settings: prev })
      throw err
    }
  },

  saveKey: async (provider, apiKey) => set({ settings: await api.saveKey(provider, apiKey) }),
  deleteKey: async (provider) => set({ settings: await api.deleteKey(provider) }),

  clear: () => set({ profile: null, settings: null, status: "idle", error: null }),
}))

export const hasKey = (settings, provider) => Boolean(settings?.keys?.some((k) => k.provider === provider))
export const providerById = (providers, id) => providers.find((p) => p.id === id)

/** Name, handle and avatar for the signed-in user: the saved profile once loaded, the sign-in provider's metadata until then. */
export function useDisplayUser() {
  const user = useAuthStore((s) => s.user)
  const profile = useAccountStore((s) => s.profile)
  if (!user) return null
  const name = profile?.display_name || user.user_metadata?.full_name || user.email
  return {
    name,
    email: user.email,
    username: profile?.username,
    avatar: profile ? profile.avatar_url : user.user_metadata?.avatar_url,
    initial: (name || "?").trim()[0]?.toUpperCase(),
  }
}

// Load when a user signs in, clear on sign-out.
let loadedFor = null
const sync = (s) => {
  const id = s.user?.id ?? null
  if (id === loadedFor) return
  loadedFor = id
  if (id) useAccountStore.getState().load()
  else useAccountStore.getState().clear()
}
useAuthStore.subscribe(sync)
sync(useAuthStore.getState())
