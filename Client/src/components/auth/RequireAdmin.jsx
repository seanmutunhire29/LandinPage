import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { RequireAuth } from "./RequireAuth"

/** True when the signed-in user has role "admin" in Supabase app_metadata. */
export function useIsAdmin() {
  return useAuthStore((s) => s.user?.app_metadata?.role === "admin")
}

function AdminOnly({ children }) {
  const isAdmin = useIsAdmin()
  // The API enforces this too; the client check only hides the pages.
  return isAdmin ? children : <Navigate to="/" replace />
}

/** Gate a route on an admin session. */
export function RequireAdmin({ children }) {
  return (
    <RequireAuth>
      <AdminOnly>{children}</AdminOnly>
    </RequireAuth>
  )
}
