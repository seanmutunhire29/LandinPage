import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { CircleCheck, Info, TriangleAlert, X } from "lucide-react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const LEVELS = {
  info: { Icon: Info, className: "border-border bg-muted text-foreground" },
  success: { Icon: CircleCheck, className: "border-success/20 bg-success/10 text-success" },
  warning: { Icon: TriangleAlert, className: "border-warning/20 bg-warning/10 text-warning" },
}

const DISMISSED_KEY = "announcement-dismissed"

/** Full-width notice bar; `level` picks the tone (info, success, warning). */
export function AnnouncementBar({ level = "info", message, onDismiss, className }) {
  const { Icon, className: tone } = LEVELS[level] ?? LEVELS.info
  return (
    <div role="status" className={cn("flex items-center gap-3 border-b px-4 py-2 text-sm font-medium", tone, className)}>
      <Icon className="size-4 shrink-0" />
      <p className="min-w-0 flex-1 text-center">{message}</p>
      {onDismiss && (
        <Button variant="ghost" size="icon-sm" onClick={onDismiss} aria-label="Dismiss announcement" className="-my-1 text-current hover:bg-foreground/5 hover:text-current">
          <X />
        </Button>
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
