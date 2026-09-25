import { Link } from "react-router-dom"

const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })

export function ProjectCard({ project }) {
  return (
    <Link
      to={`/projects/${project.id}`}
      className="flex h-full flex-col gap-2 rounded-2xl bg-white p-5 ring-1 ring-[#e3e5f0] transition-all hover:-translate-y-0.5 hover:ring-brand/40"
    >
      <span className="line-clamp-2 font-display font-semibold text-brand-navy">{project.name}</span>
      <span className="mt-auto text-xs text-[#9699a6]">Edited {formatDate(project.updated_at)}</span>
    </Link>
  )
}
