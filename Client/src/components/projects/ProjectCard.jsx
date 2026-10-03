import { Link } from "react-router-dom"

const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

/** Bordered link card for one project: initial tile, name and last-edited date. */
export function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="flex h-full min-h-36 flex-col gap-3 rounded-xl border bg-card p-4 text-card-foreground transition-colors outline-none hover:bg-accent/50 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span className="grid size-9 place-items-center rounded-md bg-muted text-sm font-semibold text-muted-foreground" aria-hidden>
        {project.name.trim()[0]?.toUpperCase()}
      </span>
      <span className="line-clamp-2 font-medium break-words">{project.name}</span>
      <span className="mt-auto text-sm text-muted-foreground">Edited {formatDate(project.updated_at)}</span>
    </Link>
  )
}
