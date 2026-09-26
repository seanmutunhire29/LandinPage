import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarDays, FolderOpen, Globe, Loader2, MapPin, PenLine, Plus, Search } from "lucide-react"
import { useAccountStore, useDisplayUser } from "@/store/useAccountStore"
import { api } from "@/lib/api"
import { AppHeader } from "@/components/account/AppHeader"
import { ProviderTile, UserAvatar } from "@/components/account/UserAvatar"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { BrandButton } from "@/components/brand/button"
import { BrandInput } from "@/components/brand/field"
import { Segmented } from "@/components/brand/segmented"
import { surfaceVariants } from "@/components/brand/surface"
import { shortModel } from "@/lib/providers"
import { cn } from "@/lib/utils"

const SORTS = [
  { id: "recent", label: "Last edited" },
  { id: "name", label: "Name" },
]
const joined = (iso) => new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" })

/** Color-blocked stat tile, in the style of the homepage's "How it works" tiles. */
function Stat({ label, value, tone, children }) {
  return (
    <div className={cn("flex min-h-32 flex-col justify-between gap-4 rounded-[39px] p-card", tone ? cn(tone, "shadow-clay") : surfaceVariants())}>
      <span className="eyebrow-xs opacity-80">{label}</span>
      {children ?? <span className="font-display text-4xl font-semibold">{value}</span>}
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
      <main className="mx-auto max-w-5xl px-gutter py-10 md:px-gutter-md md:py-14">
        <section className="overflow-hidden rounded-block bg-white shadow-clay">
          <div className="relative h-32 overflow-hidden bg-brand md:h-40" aria-hidden>
            <div className="absolute -top-12 right-[22%] size-36 rounded-full bg-brand-yellow shadow-clay" />
            <div className="absolute -right-8 -bottom-16 size-44 rounded-block bg-brand-green shadow-clay" />
            <div className="absolute top-6 right-[48%] size-10 rounded-full bg-brand-blue shadow-clay-sm" />
          </div>
          <div className="px-card pb-card-lg md:px-10">
            <div className="relative -mt-12 flex flex-wrap items-end justify-between gap-4 md:-mt-14">
              <UserAvatar src={me?.avatar} initial={me?.initial} className="size-24 font-display text-4xl font-semibold shadow-clay ring-4 ring-white md:size-28" />
              <BrandButton asChild variant="outline">
                <Link to="/settings/profile">
                  <PenLine /> Edit profile
                </Link>
              </BrandButton>
            </div>
            <h1 className="mt-5 font-display text-4xl leading-tight font-semibold text-brand-navy">{me?.name}</h1>
            {profile ? <p className="text-ui font-medium text-brand-muted">@{profile.username}</p> : <div className="mt-1 h-5 w-24 animate-pulse rounded-full bg-muted" />}
            {profile?.bio && <p className="mt-4 max-w-xl text-lg leading-relaxed text-brand-body">{profile.bio}</p>}
            {profile && (
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-brand-muted">
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-brand-subtle" /> {profile.location}
                  </span>
                )}
                {website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-brand-dark underline-offset-4 hover:underline">
                    <Globe className="size-4" /> {website}
                  </a>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4 text-brand-subtle" /> Joined {joined(profile.created_at)}
                </span>
              </div>
            )}
          </div>
        </section>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Stat label="Projects" value={profile?.stats.projects ?? "-"} tone="bg-brand text-brand-navy" />
          <Stat label="Messages sent" value={profile?.stats.messages ?? "-"} tone="bg-brand-yellow text-brand-navy" />
          <Stat label="Default model">
            {settings ? (
              <Link to="/settings/models" className="flex min-w-0 items-center gap-3 text-brand-navy hover:text-brand-dark">
                <ProviderTile provider={settings.provider} className="size-10 rounded-xl" />
                <span className="truncate font-display text-xl font-semibold">{shortModel(settings.model)}</span>
              </Link>
            ) : (
              <span className="font-display text-4xl font-semibold text-brand-navy">-</span>
            )}
          </Stat>
        </div>

        <section className="mt-stack">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h2 className="mr-auto font-display text-xl font-semibold text-brand-navy">Projects</h2>
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-brand-subtle" />
              <BrandInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects" className="w-56 pl-10" aria-label="Search projects" />
            </div>
            <Segmented options={SORTS} value={sort} onChange={setSort} label="Sort projects" />
            <BrandButton asChild>
              <Link to="/onboarding/direction">
                <Plus /> New project
              </Link>
            </BrandButton>
          </div>

          {error ? (
            <p className="text-sm text-danger">Couldn't load projects: {error}</p>
          ) : projects === null ? (
            <div className="grid place-items-center py-16">
              <Loader2 className="size-6 animate-spin text-brand-dark" />
            </div>
          ) : projects.length === 0 ? (
            <div className={cn(surfaceVariants(), "flex flex-col items-center gap-4 px-card py-16 text-center")}>
              <span className="grid size-12 place-items-center rounded-[20px] bg-brand-yellow text-brand-navy shadow-clay-sm">
                <FolderOpen className="size-6" />
              </span>
              <p className="text-ui text-brand-muted">No projects yet. Design your first landing page to get started.</p>
            </div>
          ) : shown.length === 0 ? (
            <p className={cn(surfaceVariants({ radius: "md" }), "py-10 text-center text-sm text-brand-muted")}>No projects match "{query}".</p>
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
