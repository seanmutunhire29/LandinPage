import { Navigate, useLocation } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"

/** Gate a route on a Supabase session; unauthenticated users go to the projects page to sign in. */
export function RequireAuth({ children }) {
  const ready = useAuthStore((s) => s.ready)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!ready)
    return (
      <div className="grid h-svh place-items-center bg-brand-mist">
        <Loader2 className="size-6 animate-spin text-brand" />
      </div>
    )
  if (!user) return <Navigate to="/projects" replace state={{ from: location.pathname }} />
  return children
}
