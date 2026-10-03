import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AlertTriangle, Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { createPendingProject, peekPending } from "@/lib/pendingProject"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

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
      .then((project) => navigate(project ? `/projects/${project.id}` : "/profile", { replace: true }))
      .catch((err) => setError(`Signed in, but the project couldn't be created: ${err.message}`))
  }, [ready, user, error, navigate])

  return (
    <div className="grid h-svh place-items-center bg-background p-6">
      {error ? (
        <div className="flex w-full max-w-sm flex-col items-center gap-4">
          <Alert variant="destructive">
            <AlertTriangle />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button asChild>
            <Link to={peekPending() ? "/onboarding/review" : "/profile"}>{peekPending() ? "Back to your project" : "Try again"}</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
          Signing you in...
        </div>
      )}
    </div>
  )
}
