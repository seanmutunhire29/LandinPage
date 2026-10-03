import { providerStyle } from "@/lib/providers"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

/** Round user avatar: the image when it loads, otherwise the initial. Size and text size come from `className`. */
export function UserAvatar({ src, initial, className }) {
  return (
    <Avatar className={cn("size-8 text-sm", className)}>
      {src && <AvatarImage src={src} alt="" referrerPolicy="no-referrer" />}
      <AvatarFallback className="font-medium text-foreground [font-size:inherit]">{initial}</AvatarFallback>
    </Avatar>
  )
}

/** Small tile in the provider's brand colors (inline styles from lib/providers). */
export function ProviderTile({ provider, className }) {
  const s = providerStyle(provider)
  return (
    <span
      className={cn("grid size-8 shrink-0 place-items-center rounded-lg text-sm font-semibold ring-1 ring-foreground/10 ring-inset", className)}
      style={{ background: s.bg, color: s.fg }}
      aria-hidden
    >
      {s.mark}
    </span>
  )
}
