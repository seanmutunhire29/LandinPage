import { Link, useNavigate } from "react-router-dom"
import { Cpu, LogOut, Settings, ShieldCheck, UserRound } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useAccountStore, useDisplayUser } from "@/store/useAccountStore"
import { UserAvatar } from "@/components/account/UserAvatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { shortModel } from "@/lib/providers"
import { useIsAdmin } from "./RequireAdmin"

/** Account dropdown: avatar trigger, profile/settings links and sign out. */
export function UserMenu() {
  const me = useDisplayUser()
  const settings = useAccountStore((s) => s.settings)
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()
  const isAdmin = useIsAdmin()
  if (!me) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account">
          <UserAvatar src={me.avatar} initial={me.initial} className="size-7 text-xs" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex items-center gap-2 font-normal">
          <UserAvatar src={me.avatar} initial={me.initial} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{me.name}</p>
            <p className="truncate text-xs text-muted-foreground">{me.username ? `@${me.username}` : me.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/profile">
              <UserRound /> Profile & projects
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings/models">
              <Cpu />
              <span className="flex-1">Models & API keys</span>
              {settings && <span className="max-w-24 truncate text-xs text-muted-foreground">{shortModel(settings.model)}</span>}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/settings/profile">
              <Settings /> Settings
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link to="/admin/overview">
                <ShieldCheck /> Admin dashboard
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onSelect={async () => {
            await signOut()
            navigate("/")
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
