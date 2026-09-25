import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarDays, FolderOpen, Globe, Loader2, MapPin, PenLine, Plus, Search } from "lucide-react"
import { useAccountStore, useDisplayUser } from "@/store/useAccountStore"
import { api } from "@/lib/api"
import { AppHeader } from "@/components/account/AppHeader"
import { ProviderTile, UserAvatar } from "@/components/account/UserAvatar"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { Button } from "@/components/ui/button"
import { shortModel } from "@/lib/providers"
import { cn } from "@/lib/utils"

const SORTS = [
  { id: "recent", label: "Last edited" },
  { id: "name", label: "Name" },
]
const joined = (iso) => new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" })

function Stat({ label, value, children }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl bg-white px-5 py-4 ring-1 ring-[#e3e5f0]">
      <span className="text-xs font-medium text-[#9699a6]">{label}</span>
      {children ?? <span className="font-display text-2xl font-bold text-brand-navy">{value}</span>}
    </div>
  )
}

export default function Profile() {
  const me = useDisplayUser()
  const profile = useAccountStore((s) => s.profile)
  const settings = useAccountStore((s) => s.settings)
  const [projects, setProjects] = useState(null)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("recent")

  useEffect(() => {
    api.listProjects().then(setProjects, (err) => setError(err.message))
  }, [])

  const shown = useMemo(() => {
    if (!projects) return []
    const q = query.trim().toLowerCase()
    const list = q ? projects.filter((p) => p.name.toLowerCase().includes(q)) : [...projects]
    return sort === "name" ? list.sort((a, b) => a.name.localeCompare(b.name)) : list
  }, [projects, query, sort])

  const website = profile?.website?.replace(/^https?:\/\//, "").replace(/\/$/, "")

  return (
    <div className="min-h-svh bg-brand-mist">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">
        <section className="overflow-hidden rounded-3xl bg-white ring-1 ring-[#e3e5f0]">
          <div className="h-28 bg-[radial-gradient(120%_140%_at_0%_0%,#8b8bff_0%,#6161ff_45%,#3d3db8_100%)] md:h-36" aria-hidden>
            <div className="size-full bg-[radial-gradient(circle_at_85%_30%,rgb(255_203_0/0.35),transparent_40%)]" />
          </div>
          <div className="px-5 pb-6 md:px-8">
            <div className="-mt-10 flex flex-wrap items-end justify-between gap-4 md:-mt-12">
              <UserAvatar src={me?.avatar} initial={me?.initial} className="size-20 text-3xl ring-4 ring-white md:size-24" />
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/settings/profile">
                  <PenLine data-icon="inline-start" /> Edit profile
                </Link>
              </Button>
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-brand-navy">{me?.name}</h1>
            {profile ? <p className="text-sm text-[#9699a6]">@{profile.username}</p> : <div className="mt-1 h-4 w-24 animate-pulse rounded bg-[#f1f2f8]" />}
            {profile?.bio && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#484a5e]">{profile.bio}</p>}
            {profile && (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#676879]">
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-[#9699a6]" /> {profile.location}
                  </span>
                )}
                {website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-medium text-brand hover:underline">
                    <Globe className="size-3.5" /> {website}
                  </a>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5 text-[#9699a6]" /> Joined {joined(profile.created_at)}
                </span>
              </div>
            )}
          </div>
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Projects" value={profile?.stats.projects ?? "-"} />
          <Stat label="Messages sent" value={profile?.stats.messages ?? "-"} />
          <Stat label="Default model">
            {settings ? (
              <Link to="/settings/models" className="flex min-w-0 items-center gap-2.5 hover:text-brand">
                <ProviderTile provider={settings.provider} className="size-7 text-xs" />
                <span className="truncate font-display text-base font-semibold text-brand-navy">{shortModel(settings.model)}</span>
              </Link>
            ) : (
              <span className="font-display text-2xl font-bold text-brand-navy">-</span>
            )}
          </Stat>
        </div>

        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="mr-auto font-display text-xl font-bold text-brand-navy">Projects</h2>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-[#9699a6]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects"
                className="h-9 w-48 rounded-full border border-[#e3e5f0] bg-white pr-3 pl-8.5 text-sm text-brand-navy outline-none placeholder:text-[#9699a6] focus:border-brand/50 focus:ring-3 focus:ring-brand/15"
                aria-label="Search projects"
              />
            </div>
            <div className="flex rounded-full bg-white p-0.5 ring-1 ring-[#e3e5f0]" role="group" aria-label="Sort projects">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSort(s.id)}
                  aria-pressed={sort === s.id}
                  className={cn("rounded-full px-3 py-1 text-[13px] font-medium transition-colors", sort === s.id ? "bg-brand text-white" : "text-[#676879] hover:text-brand-navy")}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <Button asChild className="h-9 rounded-full bg-brand px-4 text-white hover:bg-brand-dark">
              <Link to="/onboarding/direction">
                <Plus data-icon="inline-start" /> New project
              </Link>
            </Button>
          </div>

          {error ? (
            <p className="text-sm text-destructive">Couldn't load projects: {error}</p>
          ) : projects === null ? (
            <div className="grid place-items-center py-16">
              <Loader2 className="size-6 animate-spin text-brand" />
            </div>
          ) : projects.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-3xl bg-white py-16 text-center ring-1 ring-[#e3e5f0]">
              <FolderOpen className="size-8 text-[#9699a6]" />
              <p className="text-[#676879]">No projects yet. Design your first landing page to get started.</p>
            </div>
          ) : shown.length === 0 ? (
            <p className="rounded-2xl bg-white py-10 text-center text-sm text-[#676879] ring-1 ring-[#e3e5f0]">No projects match "{query}".</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((p) => (
                <li key={p.id}>
                  <ProjectCard project={p} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
