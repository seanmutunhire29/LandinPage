import { useState } from "react"
import { providerStyle } from "@/lib/providers"
import { cn } from "@/lib/utils"

export function UserAvatar({ src, initial, className }) {
  const [broken, setBroken] = useState(null)
  const showImage = src && broken !== src
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-brand font-display font-semibold text-brand-navy shadow-brand-sm select-none", className)}>
      {showImage ? <img src={src} alt="" className="size-full object-cover" referrerPolicy="no-referrer" onError={() => setBroken(src)} /> : initial}
    </span>
  )
}

export function ProviderTile({ provider, className }) {
  const s = providerStyle(provider)
  return (
    <span
      className={cn("grid size-8 shrink-0 place-items-center rounded-lg font-display text-sm font-semibold shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)]", className)}
      style={{ background: s.bg, color: s.fg }}
      aria-hidden
    >
      {s.mark}
    </span>
  )
}
