import { create } from "zustand"
import { supabase } from "@/lib/supabase"

export const useAuthStore = create((set) => ({
  session: null,
  user: null,
  ready: false, // true once the initial session check has finished

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null })
  },
}))

const apply = (session) => useAuthStore.setState({ session, user: session?.user ?? null, ready: true })

supabase.auth.getSession().then(({ data }) => apply(data.session))
supabase.auth.onAuthStateChange((_event, session) => apply(session))

/** Current access token, refreshed by supabase-js if it is about to expire. */
export async function getAccessToken() {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? null
}
