import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { FolderOpen, Loader2, Plus } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { api } from "@/lib/api"
import { AppHeader } from "@/components/account/AppHeader"
import { AuthDialog } from "@/components/auth/AuthDialog"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/projects/ProjectCard"

export default function Projects() {
  const ready = useAuthStore((s) => s.ready)
  const user = useAuthStore((s) => s.user)
  const [projects, setProjects] = useState(null)
  const [error, setError] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    api.listProjects().then(setProjects, (err) => setError(err.message))
  }, [user])

  return (
    <div className="min-h-svh bg-brand-mist">
      <AppHeader />

      <main className="mx-auto max-w-5xl px-5 py-10 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-brand-navy">Your projects</h1>
            <p className="mt-1 text-[#676879]">Every project is saved, so you can reopen it and keep editing.</p>
          </div>
          {user && (
            <Button asChild size="lg" className="h-11 rounded-full bg-brand px-5 text-white hover:bg-brand-dark">
              <Link to="/onboarding/direction">
                <Plus data-icon="inline-start" /> New project
              </Link>
            </Button>
          )}
        </div>

        {!ready || (user && projects === null && !error) ? (
          <div className="grid place-items-center py-24">
            <Loader2 className="size-6 animate-spin text-brand" />
          </div>
        ) : !user ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-white py-16 text-center ring-1 ring-[#e3e5f0]">
            <p className="text-[#676879]">Sign in to see your projects.</p>
            <Button onClick={() => setAuthOpen(true)} size="lg" className="h-11 rounded-full bg-brand px-6 text-white hover:bg-brand-dark">
              Sign in
            </Button>
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">Couldn't load projects: {error}</p>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-white py-16 text-center ring-1 ring-[#e3e5f0]">
            <FolderOpen className="size-8 text-[#9699a6]" />
            <p className="text-[#676879]">No projects yet. Design your first landing page to get started.</p>
            <Button asChild size="lg" className="h-11 rounded-full bg-brand px-6 text-white hover:bg-brand-dark">
              <Link to="/onboarding/direction">Get started</Link>
            </Button>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <li key={p.id}>
                <ProjectCard project={p} />
              </li>
            ))}
          </ul>
        )}
      </main>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} initialMode="login" redirectTo={`${window.location.origin}/auth/callback`} onAuthenticated={() => setAuthOpen(false)} />
    </div>
  )
}
