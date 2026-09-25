import { cn } from "@/lib/utils"

/** An "L" page corner with a dot landing in it. */
export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8 shrink-0", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#6161FF" />
      <path d="M11 8.5V20a3 3 0 0 0 3 3h9" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M20 7v3.5" stroke="#fff" strokeOpacity=".45" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="16" r="3" fill="#FFCB00" />
    </svg>
  )
}

const SIZES = { md: "h-7", sm: "h-6" }

/** Wordmark image from public/logo.png. The PNG has an off-white background, so multiply blends it into light surfaces. */
export function Logo({ className, size = "md" }) {
  return (
    <img
      src="/logo.png"
      alt="LandinPage"
      className={cn("inline-block w-auto shrink-0 select-none mix-blend-multiply", SIZES[size], className)}
      draggable={false}
    />
  )
}
