import { useState } from "react"
import { Loader2, MailCheck } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.7 2.3 2.4 6.6 2.4 12s4.3 9.7 9.6 9.7c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  )
}

/**
 * Signup/login modal. `redirectTo` is where OAuth and email-confirmation links
 * return to; `onAuthenticated` fires when email/password sign-in succeeds in place.
 */
export function AuthDialog({ open, onOpenChange, onAuthenticated, redirectTo, title, description, initialMode = "signup" }) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(null) // "email" | "google" | null
  const [error, setError] = useState(null)
  const [confirmSent, setConfirmSent] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy("email")
    setError(null)
    const { data, error } =
      mode === "signup"
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } })
        : await supabase.auth.signInWithPassword({ email, password })
    setBusy(null)
    if (error) return setError(error.message)
    // Signup with email confirmation on returns no session until the link is clicked.
    if (!data.session) return setConfirmSent(true)
    onAuthenticated?.(data.session)
  }

  const google = async () => {
    setBusy("google")
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } })
    if (error) {
      setBusy(null)
      setError(error.message)
    }
    // On success the browser navigates away to Google.
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {confirmSent ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <MailCheck className="size-10 text-brand" />
            <DialogTitle>Check your inbox</DialogTitle>
            <DialogDescription>
              We sent a confirmation link to <span className="font-semibold text-brand-navy">{email}</span>. Open it in this browser and
              we'll pick up right where you left off.
            </DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{title ?? (mode === "signup" ? "Create your account" : "Welcome back")}</DialogTitle>
              <DialogDescription>{description ?? "Sign in to save your projects."}</DialogDescription>
            </DialogHeader>

            <Button variant="outline" size="lg" className="h-11 rounded-full" onClick={google} disabled={Boolean(busy)}>
              {busy === "google" ? <Loader2 className="animate-spin" /> : <GoogleIcon />}
              Continue with Google
            </Button>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>

            <Tabs value={mode} onValueChange={(v) => { setMode(v); setError(null) }}>
              <TabsList className="w-full">
                <TabsTrigger value="signup">Sign up</TabsTrigger>
                <TabsTrigger value="login">Log in</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={submit} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-email">Email</Label>
                <Input id="auth-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-10" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-password">Password</Label>
                <Input
                  id="auth-password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  minLength={6}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" size="lg" className="h-11 rounded-full bg-brand text-white hover:bg-brand-dark" disabled={Boolean(busy)}>
                {busy === "email" && <Loader2 className="animate-spin" />}
                {mode === "signup" ? "Create account" : "Log in"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
