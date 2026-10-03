import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AlertCircle, ArrowLeft, Check, Copy, Loader2, Pencil, RotateCcw, Sparkles } from "lucide-react"
import { useDesignStore } from "@/store/useDesignStore"
import { useAuthStore } from "@/store/useAuthStore"
import { buildSpec } from "@/lib/buildSpec"
import { createPendingProject, peekPending, savePending } from "@/lib/pendingProject"
import { StagePage } from "@/components/wizard/WizardLayout"
import { StageHeader } from "@/components/wizard/StageHeader"
import { useStageNav } from "@/components/wizard/useStageNav"
import { ChatInput } from "@/components/chat/ChatInput"
import { AuthDialog } from "@/components/auth/AuthDialog"
import { Alert, AlertAction, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const SUGGESTIONS = [
  "A landing page for a project management SaaS",
  "A waitlist page for an AI note-taking app",
  "A launch page for a specialty coffee subscription",
]

export default function Review() {
  const state = useDesignStore()
  const reset = useDesignStore((s) => s.reset)
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const { goBack } = useStageNav("review")

  const spec = useMemo(() => buildSpec(state), [state])
  const json = useMemo(() => JSON.stringify(spec, null, 2), [spec])
  const [copied, setCopied] = useState(false)
  // A message typed before signing in survives reloads and auth redirects.
  const [sent, setSent] = useState(() => peekPending()?.firstMessage ?? null)
  const [authOpen, setAuthOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const t = spec.tokens
  const summary = [spec.meta.direction.name, `${t.typography.headingFont.family} / ${t.typography.bodyFont.family}`, t.color.palette.name, `${spec.composition.sections.length} sections`]

  const copy = async () => {
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const create = async () => {
    setCreating(true)
    setError(null)
    try {
      const project = await createPendingProject()
      if (project) navigate(`/projects/${project.id}`)
      else setCreating(false)
    } catch (err) {
      setError(err.message)
      setCreating(false)
    }
  }

  const submit = (text) => {
    savePending(text, buildSpec(state))
    setSent(text)
    if (user) create()
    else setAuthOpen(true)
  }

  return (
    <StagePage>
      <StageHeader eyebrow="Final step" title="Describe your project" blurb="Your design system is ready. Tell us what the page is for and we'll build it live.">
        <Button variant="outline" size="lg" onClick={copy} className="shrink-0 self-start md:self-auto">
          {copied ? <Check data-icon="inline-start" className="text-success" /> : <Copy data-icon="inline-start" />}
          {copied ? "Copied" : "Copy JSON"}
        </Button>
      </StageHeader>

      <div className="mx-auto flex max-w-3xl flex-col gap-4 pb-16">
        <div className="flex flex-wrap items-center gap-2">
          {summary.map((s) => (
            <Badge key={s} variant="outline" className="max-w-full truncate">
              {s}
            </Badge>
          ))}
          <Button variant="link" size="sm" asChild className="px-1">
            <Link to="/onboarding/direction">
              <Pencil data-icon="inline-start" /> Edit choices
            </Link>
          </Button>
        </div>

        <Card role="region" aria-label="Project chat" className="min-h-[420px] px-4 py-5 md:p-6">
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="size-4" />
              </span>
              <p className="pt-1 text-sm leading-relaxed text-foreground md:text-base">
                What are we building? Describe the product and who it's for. I'll use your spec for every design decision and write the copy too.
              </p>
            </div>

            {sent && (
              <div className="ml-8 self-end rounded-xl rounded-br-sm bg-primary px-4 py-2.5 text-sm whitespace-pre-wrap text-primary-foreground md:text-base">{sent}</div>
            )}

            {sent && !user && !authOpen && (
              <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                <span className="flex-1">Sign in to save your progress and start building.</span>
                <Button onClick={() => setAuthOpen(true)}>Continue</Button>
              </div>
            )}

            {creating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-muted-foreground" /> Setting up your project...
              </div>
            )}
            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription className="text-destructive/90">Couldn't create the project: {error}</AlertDescription>
                <AlertAction>
                  <Button variant="outline" size="xs" onClick={create}>
                    Try again
                  </Button>
                </AlertAction>
              </Alert>
            )}
          </div>

          {!sent && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <Button key={s} variant="outline" size="sm" onClick={() => submit(s)} className="h-auto min-h-7 py-1 text-left whitespace-normal text-muted-foreground">
                  {s}
                </Button>
              ))}
            </div>
          )}
          <ChatInput
            onSubmit={submit}
            busy={creating}
            disabled={Boolean(sent) && !error}
            autoFocus
            placeholder="e.g. A landing page for a project management SaaS aimed at agencies"
          />
        </Card>

        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={goBack} className="text-muted-foreground">
            <ArrowLeft data-icon="inline-start" /> Back
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              reset()
              navigate("/onboarding/direction")
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <RotateCcw data-icon="inline-start" /> Start over
          </Button>
        </div>
      </div>

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        redirectTo={`${window.location.origin}/auth/callback`}
        title="Save your progress"
        description="Create a free account so your design spec and project are saved. You can pick up where you left off from any device."
        onAuthenticated={() => {
          setAuthOpen(false)
          create()
        }}
      />
    </StagePage>
  )
}
