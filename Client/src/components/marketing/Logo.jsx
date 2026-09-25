import { cn } from "@/lib/utils"

export function Logo({ className, light }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="9" fill="#6161FF" />
        <circle cx="10" cy="22" r="3.5" fill="#FFCB00" />
        <circle cx="16" cy="16" r="3.5" fill="#FF3D57" />
        <circle cx="22" cy="10" r="3.5" fill="#00CA72" />
      </svg>
      <span className={cn("font-display text-lg font-bold tracking-tight", light ? "text-white" : "text-brand-navy")}>
        LandInPage
      </span>
    </span>
  )
}
