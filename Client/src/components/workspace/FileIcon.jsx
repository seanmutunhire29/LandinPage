import { Atom, BookOpen, Braces, CodeXml, FileCode2, FileText, Hash, Image, Package, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Brand hues, lifted for contrast on the dark editor chrome.
const TYPES = [
  { test: (n) => n === "package.json", Icon: Package, color: "text-[#33d68e]" },
  { test: (n) => /(^\.|\.config\.[cm]?[jt]s$|^tsconfig|^jsconfig|lock\.json$|^\.?env)/.test(n), Icon: Settings2, color: "text-brand-subtle" },
  { test: (n) => /\.[jt]sx$/.test(n), Icon: Atom, color: "text-[#7fb3fd]" },
  { test: (n) => /\.[cm]?[jt]s$/.test(n), Icon: FileCode2, color: "text-[#ffd84d]" },
  { test: (n) => /\.(css|scss)$/.test(n), Icon: Hash, color: "text-[#a0a0ff]" },
  { test: (n) => n.endsWith(".json"), Icon: Braces, color: "text-[#ffcb00]" },
  { test: (n) => n.endsWith(".html"), Icon: CodeXml, color: "text-[#ff7a8c]" },
  { test: (n) => /\.(svg|png|jpe?g|gif|webp|ico)$/.test(n), Icon: Image, color: "text-[#33d68e]" },
  { test: (n) => /\.mdx?$/.test(n), Icon: BookOpen, color: "text-[#9fb4d9]" },
]
const FALLBACK = { Icon: FileText, color: "text-white/40" }

const fileType = (path) => {
  const name = path.split("/").pop().toLowerCase()
  return TYPES.find((t) => t.test(name)) ?? FALLBACK
}

export function FileIcon({ path, className }) {
  const { Icon, color } = fileType(path)
  return <Icon className={cn("size-3.5 shrink-0", color, className)} strokeWidth={2} aria-hidden />
}
