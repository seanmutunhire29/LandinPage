import { useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function UserMenu() {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()
  if (!user) return null

  const name = user.user_metadata?.full_name || user.email
  const avatar = user.user_metadata?.avatar_url
  const initial = (name || "?").trim()[0]?.toUpperCase()

  return (
    <Popover>
      <PopoverTrigger className="grid size-8 place-items-center overflow-hidden rounded-full bg-brand text-sm font-semibold text-white ring-2 ring-white" aria-label="Account">
        {avatar ? <img src={avatar} alt="" className="size-full object-cover" referrerPolicy="no-referrer" /> : initial}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-60">
        <div className="px-1">
          <p className="truncate text-sm font-semibold text-brand-navy">{user.user_metadata?.full_name ?? "Signed in"}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
        <button
          onClick={async () => {
            await signOut()
            navigate("/")
          }}
          className="flex items-center gap-2 rounded-md px-1 py-1.5 text-sm text-[#676879] hover:bg-muted hover:text-brand-navy"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </PopoverContent>
    </Popover>
  )
}
