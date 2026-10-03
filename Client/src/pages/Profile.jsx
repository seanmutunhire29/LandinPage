import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CalendarDays, CircleAlert, FolderOpen, Globe, MapPin, PenLine, Plus, Search } from "lucide-react"
import { useAccountStore, useDisplayUser } from "@/store/useAccountStore"
import { api } from "@/lib/api"
import { AppHeader } from "@/components/account/AppHeader"
import { ProviderTile, UserAvatar } from "@/components/account/UserAvatar"
import { ProjectCard } from "@/components/projects/ProjectCard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Skeleton } from "@/components/ui/skeleton"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { shortModel } from "@/lib/providers"

const SORTS = [
  { id: "recent", label: "Last edited" },
  { id: "name", label: "Name" },
]
const joined = (iso) => new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" })

/** Small stat card: muted label on top, value (or custom content) below. */
function Stat({ label, value, children }) {
  return (
    <Card size="sm">
      <CardContent className="flex min-h-20 flex-col justify-between gap-3">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
        {children ?? <span className="text-2xl font-semibold tracking-tight">{value}</span>}
      </CardContent>
    </Card>
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
    <div className="min-h-svh bg-background">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-12">
        <Card className="pt-0">
          <div className="h-24 bg-muted md:h-28" aria-hidden />
          <CardContent className="md:px-6">
            <div className="-mt-12 flex flex-wrap items-end justify-between gap-4 md:-mt-14">
              <UserAvatar src={me?.avatar} initial={me?.initial} className="size-24 text-3xl ring-4 ring-card md:size-28" />
              <Button asChild variant="outline">
                <Link to="/settings/profile">
                  <PenLine /> Edit profile
                </Link>
              </Button>
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight break-words md:text-3xl">{me?.name}</h1>
            {profile ? <p className="text-sm text-muted-foreground">@{profile.username}</p> : <Skeleton className="mt-1 h-5 w-24" />}
            {profile?.bio && <p className="mt-4 max-w-xl text-base leading-relaxed">{profile.bio}</p>}
            {profile && (
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4" /> {profile.location}
                  </span>
                )}
                {website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-w-0 items-center gap-1.5 rounded-sm font-medium text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <Globe className="size-4 shrink-0" /> <span className="truncate">{website}</span>
                  </a>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" /> Joined {joined(profile.created_at)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Stat label="Projects" value={profile?.stats.projects ?? "-"} />
          <Stat label="Messages sent" value={profile?.stats.messages ?? "-"} />
          <Stat label="Default model">
            {settings ? (
              <Link
                to="/settings/models"
                className="flex min-w-0 items-center gap-2.5 rounded-md outline-none hover:underline hover:underline-offset-4 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <ProviderTile provider={settings.provider} className="size-8 rounded-md" />
                <span className="truncate text-base font-semibold">{shortModel(settings.model)}</span>
              </Link>
            ) : (
              <span className="text-2xl font-semibold tracking-tight">-</span>
            )}
          </Stat>
        </div>

        <section className="mt-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="mr-auto text-lg font-semibold">Projects</h2>
            <InputGroup className="w-full sm:w-56">
              <InputGroupInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects" aria-label="Search projects" />
              <InputGroupAddon>
                <Search />
              </InputGroupAddon>
            </InputGroup>
            <ToggleGroup type="single" variant="outline" value={sort} onValueChange={(v) => v && setSort(v)} aria-label="Sort projects">
              {SORTS.map(({ id, label }) => (
                <ToggleGroupItem key={id} value={id}>
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Button asChild>
              <Link to="/onboarding/direction">
                <Plus /> New project
              </Link>
            </Button>
          </div>

          {error ? (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertDescription>Couldn't load projects: {error}</AlertDescription>
            </Alert>
          ) : projects === null ? (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading projects">
              {[0, 1, 2].map((i) => (
                <li key={i}>
                  <Skeleton className="h-36 rounded-xl" />
                </li>
              ))}
            </ul>
          ) : projects.length === 0 ? (
            <Card className="items-center py-12 text-center">
              <CardContent className="flex flex-col items-center gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-muted text-muted-foreground">
                  <FolderOpen className="size-5" />
                </span>
                <p className="text-sm text-muted-foreground">No projects yet. Design your first landing page to get started.</p>
              </CardContent>
            </Card>
          ) : shown.length === 0 ? (
            <Card className="py-8 text-center">
              <CardContent>
                <p className="text-sm text-muted-foreground">No projects match "{query}".</p>
              </CardContent>
            </Card>
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
