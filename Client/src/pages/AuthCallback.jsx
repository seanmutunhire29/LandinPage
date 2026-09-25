import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { createPendingProject } from "@/lib/pendingProject"

/**
 * OAuth and email-confirmation links land here. supabase-js exchanges the code
 * in the URL for a session on load; once it exists we create the project the
 * user started before signing in, then open it.
 */
export default function AuthCallback() {
  const ready = useAuthStore((s) => s.ready)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const params = new URLSearchParams(window.location.search + window.location.hash.replace(/^#/, "&"))
  const [error, setError] = useState(params.get("error_description"))

  useEffect(() => {
    if (error || !ready) return
    if (!user) {
      // Give the PKCE code exchange a moment before giving up.
      const t = setTimeout(() => !useAuthStore.getState().user && setError("Sign-in didn't complete. Please try again."), 8000)
      return () => clearTimeout(t)
    }
    createPendingProject()
      .then((project) => navigate(project ? `/projects/${project.id}` : "/projects", { replace: true }))
      .catch((err) => setError(`Signed in, but the project couldn't be created: ${err.message}`))
  }, [ready, user, error, navigate])

  return (
    <div className="grid h-svh place-items-center bg-brand-mist p-6">
      {error ? (
        <div className="flex max-w-sm flex-col items-center gap-3 text-center">
          <AlertTriangle className="size-8 text-brand-red" />
          <p className="font-display text-lg font-semibold text-brand-navy">Something went wrong</p>
          <p className="text-sm text-[#676879]">{error}</p>
          <Link to="/onboarding/review" className="mt-2 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark">
            Back to your project
          </Link>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-sm text-[#676879]">
          <Loader2 className="size-6 animate-spin text-brand" />
          Signing you in...
        </div>
      )}
    </div>
  )
}
