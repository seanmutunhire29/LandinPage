import { Link } from "react-router-dom"
import { surfaceVariants } from "@/components/brand/surface"
import { cn } from "@/lib/utils"

const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

// The homepage's accent blocks, assigned per project so a grid reads as color-blocked.
const TILES = ["bg-brand text-brand-navy", "bg-brand-red text-brand-navy", "bg-brand-yellow text-brand-navy", "bg-brand-green text-brand-navy", "bg-brand-blue text-brand-navy"]
const tileFor = (id) => TILES[[...String(id)].reduce((sum, c) => sum + c.charCodeAt(0), 0) % TILES.length]

export function ProjectCard({ project }) {
  return (
    <Link to={`/projects/${project.id}`} className={cn(surfaceVariants({ interactive: true }), "flex h-full min-h-44 flex-col gap-4 p-card")}>
      <span className={cn("grid size-11 place-items-center rounded-[18px] font-display text-lg font-semibold shadow-clay-sm", tileFor(project.id))} aria-hidden>
        {project.name.trim()[0]?.toUpperCase()}
      </span>
      <span className="line-clamp-2 font-display text-xl font-semibold text-brand-navy">{project.name}</span>
      <span className="mt-auto text-sm text-brand-subtle">Edited {formatDate(project.updated_at)}</span>
    </Link>
  )
}
