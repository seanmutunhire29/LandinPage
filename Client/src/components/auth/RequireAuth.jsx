import { useState } from "react"
import { Loader2, LockKeyhole } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { AppHeader } from "@/components/account/AppHeader"
import { AuthDialog } from "@/components/auth/AuthDialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/** Gate a route on a Supabase session; signed-out users get a sign-in prompt in place. */
export function RequireAuth({ children }) {
  const ready = useAuthStore((s) => s.ready)
  const user = useAuthStore((s) => s.user)
  const [authOpen, setAuthOpen] = useState(true)

  if (!ready)
    return (
      <div className="grid h-svh place-items-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  if (user) return children

  return (
    <div className="min-h-svh bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-16 md:px-6">
        <Card className="mx-auto max-w-md py-8 text-center">
          <CardHeader className="justify-items-center">
            <span className="mb-2 grid size-10 place-items-center rounded-md bg-muted text-muted-foreground">
              <LockKeyhole className="size-5" />
            </span>
            <CardTitle className="text-lg font-semibold">Sign in to continue</CardTitle>
            <CardDescription>Your profile, projects, and settings are waiting.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setAuthOpen(true)} size="lg">
              Sign in
            </Button>
          </CardContent>
        </Card>
      </main>
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialMode="login"
        redirectTo={`${window.location.origin}/auth/callback`}
        onAuthenticated={() => setAuthOpen(false)}
      />
    </div>
  )
}
