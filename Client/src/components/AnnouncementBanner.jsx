import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { CircleCheck, Info, TriangleAlert, X } from "lucide-react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

const LEVELS = {
  info: { Icon: Info, className: "bg-brand-navy text-white" },
  success: { Icon: CircleCheck, className: "bg-emerald-700 text-white" },
  warning: { Icon: TriangleAlert, className: "bg-amber-300 text-amber-950" },
}

const DISMISSED_KEY = "announcement-dismissed"

export function AnnouncementBar({ level = "info", message, onDismiss, className }) {
  const { Icon, className: tone } = LEVELS[level] ?? LEVELS.info
  return (
    <div role="status" className={cn("flex items-center gap-3 px-4 py-2.5 text-sm font-medium", tone, className)}>
      <Icon className="size-4 shrink-0" />
      <p className="min-w-0 flex-1 text-center">{message}</p>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss announcement" className="rounded-full p-1 opacity-70 transition-opacity hover:opacity-100">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}

/** The site-wide announcement set in the admin dashboard. Hidden in the full-screen workspace. */
export function AnnouncementBanner() {
  const { pathname } = useLocation()
  const [announcement, setAnnouncement] = useState(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISSED_KEY))

  useEffect(() => {
    api.getAnnouncement().then(setAnnouncement, () => {})
  }, [])

  if (!announcement?.enabled || !announcement.message || pathname.startsWith("/projects/")) return null
  // Dismissal is per message, so a new announcement shows again.
  const id = `${announcement.level}:${announcement.message}`
  if (dismissed === id) return null

  return (
    <AnnouncementBar
      level={announcement.level}
      message={announcement.message}
      onDismiss={() => {
        localStorage.setItem(DISMISSED_KEY, id)
        setDismissed(id)
      }}
    />
  )
}
