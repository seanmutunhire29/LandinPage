import { Atom, BookOpen, Braces, CodeXml, FileCode2, FileText, Hash, Image, Package, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

// File-type syntax coloring, paired so each hue stays legible on light and dark panels.
const TYPES = [
  { test: (n) => n === "package.json", Icon: Package, color: "text-green-600 dark:text-green-400" },
  { test: (n) => /(^\.|\.config\.[cm]?[jt]s$|^tsconfig|^jsconfig|lock\.json$|^\.?env)/.test(n), Icon: Settings2, color: "text-muted-foreground" },
  { test: (n) => /\.[jt]sx$/.test(n), Icon: Atom, color: "text-sky-600 dark:text-sky-400" },
  { test: (n) => /\.[cm]?[jt]s$/.test(n), Icon: FileCode2, color: "text-yellow-600 dark:text-yellow-400" },
  { test: (n) => /\.(css|scss)$/.test(n), Icon: Hash, color: "text-indigo-600 dark:text-indigo-400" },
  { test: (n) => n.endsWith(".json"), Icon: Braces, color: "text-orange-600 dark:text-orange-400" },
  { test: (n) => n.endsWith(".html"), Icon: CodeXml, color: "text-rose-600 dark:text-rose-400" },
  { test: (n) => /\.(svg|png|jpe?g|gif|webp|ico)$/.test(n), Icon: Image, color: "text-teal-600 dark:text-teal-400" },
  { test: (n) => /\.mdx?$/.test(n), Icon: BookOpen, color: "text-slate-600 dark:text-slate-400" },
]
const FALLBACK = { Icon: FileText, color: "text-muted-foreground" }

const fileType = (path) => {
  const name = path.split("/").pop().toLowerCase()
  return TYPES.find((t) => t.test(name)) ?? FALLBACK
}

export function FileIcon({ path, className }) {
  const { Icon, color } = fileType(path)
  return <Icon className={cn("size-3.5 shrink-0", color, className)} strokeWidth={2} aria-hidden />
}
