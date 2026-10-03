import { cn } from "@/lib/utils"

/** An "L" page corner with a dot landing in it. */
export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8 shrink-0", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#A78BFA" />
      <path d="M11 8.5V20a3 3 0 0 0 3 3h9" fill="none" stroke="#3B0764" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M20 7v3.5" stroke="#3B0764" strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="16" r="3" fill="#86EFAC" />
    </svg>
  )
}

const SIZES = { md: "h-7", sm: "h-6" }

/**
 * Wordmark image from public/logo.png. The PNG is navy on off-white: multiply blends it into light
 * surfaces, and in dark mode it is inverted (hue-rotated back) and screened so it reads light on dark.
 */
export function Logo({ className, size = "md" }) {
  return (
    <img
      src="/logo.png"
      alt="LandinPage"
      className={cn("inline-block w-auto shrink-0 select-none mix-blend-multiply dark:mix-blend-screen dark:invert dark:hue-rotate-180", SIZES[size], className)}
      draggable={false}
    />
  )
}
