import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { ArrowLeft, Check, Copy, Loader2, Pencil, RotateCcw, Sparkles } from "lucide-react"
import { useDesignStore } from "@/store/useDesignStore"
import { useAuthStore } from "@/store/useAuthStore"
import { buildSpec } from "@/lib/buildSpec"
import { createPendingProject, peekPending, savePending } from "@/lib/pendingProject"
import { StagePage } from "@/components/wizard/WizardLayout"
import { StageHeader } from "@/components/wizard/StageHeader"
import { useStageNav } from "@/components/wizard/useStageNav"
import { ChatInput } from "@/components/chat/ChatInput"
import { AuthDialog } from "@/components/auth/AuthDialog"
import { Button } from "@/components/ui/button"

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
        <Button variant="outline" size="lg" onClick={copy} className="h-11 shrink-0 rounded-full px-5">
          {copied ? <Check data-icon="inline-start" className="text-brand-green" /> : <Copy data-icon="inline-start" />}
          {copied ? "Copied" : "Copy JSON"}
        </Button>
      </StageHeader>

      <div className="mx-auto flex max-w-3xl flex-col gap-4 pb-16">
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#676879]">
          {summary.map((s) => (
            <span key={s} className="rounded-full bg-white px-3 py-1 font-medium ring-1 ring-[#e3e5f0]">
              {s}
            </span>
          ))}
          <Link to="/onboarding/direction" className="inline-flex items-center gap-1 px-1 font-semibold text-brand hover:underline">
            <Pencil className="size-3" /> Edit choices
          </Link>
        </div>

        <section className="flex min-h-[420px] flex-col rounded-3xl bg-white p-4 ring-1 ring-[#e3e5f0] md:p-6" aria-label="Project chat">
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand text-white">
                <Sparkles className="size-4" />
              </span>
              <p className="pt-1 text-[15px] leading-relaxed text-brand-navy">
                What are we building? Describe the product and who it's for. I'll use your spec for every design decision and write the copy too.
              </p>
            </div>

            {sent && (
              <div className="ml-8 self-end rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-[15px] whitespace-pre-wrap text-white">{sent}</div>
            )}

            {sent && !user && !authOpen && (
              <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#f6f7fb] p-4 text-sm text-[#676879]">
                <span className="flex-1">Sign in to save your progress and start building.</span>
                <Button onClick={() => setAuthOpen(true)} className="rounded-full bg-brand px-5 text-white hover:bg-brand-dark">
                  Continue
                </Button>
              </div>
            )}

            {creating && (
              <div className="flex items-center gap-2 text-sm text-[#676879]">
                <Loader2 className="size-4 animate-spin text-brand" /> Setting up your project...
              </div>
            )}
            {error && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl bg-[#fff0f2] px-3 py-2.5 text-sm text-[#b3263e] ring-1 ring-[#ffd0d8]">
                <span className="flex-1">Couldn't create the project: {error}</span>
                <button onClick={create} className="font-semibold underline">
                  Try again
                </button>
              </div>
            )}
          </div>

          {!sent && (
            <div className="mt-6 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => submit(s)} className="rounded-full bg-[#f6f7fb] px-3 py-1.5 text-left text-xs font-medium text-[#676879] ring-1 ring-[#e3e5f0] hover:text-brand">
                  {s}
                </button>
              ))}
            </div>
          )}
          <ChatInput
            className="mt-4"
            onSubmit={submit}
            busy={creating}
            disabled={Boolean(sent) && !error}
            autoFocus
            placeholder="e.g. A landing page for a project management SaaS aimed at agencies"
          />
        </section>

        <div className="flex items-center justify-between text-sm font-semibold text-[#676879]">
          <button onClick={goBack} className="inline-flex items-center gap-2 hover:text-brand-navy">
            <ArrowLeft className="size-4" /> Back
          </button>
          <button
            onClick={() => {
              reset()
              navigate("/onboarding/direction")
            }}
            className="inline-flex items-center gap-2 hover:text-brand-red"
          >
            <RotateCcw className="size-4" /> Start over
          </button>
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
