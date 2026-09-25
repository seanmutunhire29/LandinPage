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

const SIZES = {
  md: { mark: "size-8", text: "text-lg", gap: "gap-2" },
  sm: { mark: "size-7", text: "text-[15px]", gap: "gap-2" },
}

/** Wordmark: "Land in Page", with the "in" set lighter in brand violet. */
export function Logo({ className, light, size = "md" }) {
  const s = SIZES[size]
  return (
    <span className={cn("inline-flex items-center", s.gap, className)}>
      <LogoMark className={s.mark} />
      <span className={cn("font-display font-bold tracking-[-0.02em]", s.text, light ? "text-white" : "text-brand-navy")}>
        Land<span className={cn("px-[0.04em] font-medium", light ? "text-[#a9a9ff]" : "text-brand")}>in</span>Page
      </span>
    </span>
  )
}
