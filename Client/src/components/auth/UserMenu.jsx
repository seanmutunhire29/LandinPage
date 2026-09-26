import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Cpu, LogOut, Settings, UserRound } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { useAccountStore, useDisplayUser } from "@/store/useAccountStore"
import { UserAvatar } from "@/components/account/UserAvatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { shortModel } from "@/lib/providers"

function Item({ to, Icon, children, caption, onSelect }) {
  return (
    <Link
      to={to}
      onClick={onSelect}
      className="flex items-center gap-2.5 rounded-full px-3 py-1.5 text-sm font-semibold text-brand-body transition-colors hover:bg-muted hover:text-brand-navy"
    >
      <Icon className="size-4 text-brand-subtle" />
      <span className="flex-1">{children}</span>
      {caption && <span className="max-w-24 truncate text-xs font-normal text-brand-subtle">{caption}</span>}
    </Link>
  )
}

export function UserMenu() {
  const me = useDisplayUser()
  const settings = useAccountStore((s) => s.settings)
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  if (!me) return null
  const close = () => setOpen(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="rounded-full ring-2 ring-white outline-none focus-visible:ring-4 focus-visible:ring-brand/30" aria-label="Account">
        <UserAvatar src={me.avatar} initial={me.initial} className="text-sm" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-1 rounded-[26px] p-2 shadow-float ring-0">
        <Link to="/profile" onClick={close} className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-brand-fill">
          <UserAvatar src={me.avatar} initial={me.initial} className="size-10 text-base" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brand-navy">{me.name}</p>
            <p className="truncate text-xs text-brand-subtle">{me.username ? `@${me.username}` : me.email}</p>
          </div>
        </Link>
        <div className="my-1 h-px bg-border" />
        <Item to="/profile" Icon={UserRound} onSelect={close}>
          Profile & projects
        </Item>
        <Item to="/settings/models" Icon={Cpu} caption={settings && shortModel(settings.model)} onSelect={close}>
          Models & API keys
        </Item>
        <Item to="/settings/profile" Icon={Settings} onSelect={close}>
          Settings
        </Item>
        <div className="my-1 h-px bg-border" />
        <button
          onClick={async () => {
            close()
            await signOut()
            navigate("/")
          }}
          className="flex items-center gap-2.5 rounded-full px-3 py-1.5 text-sm font-semibold text-brand-body transition-colors hover:bg-danger-soft hover:text-danger"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </PopoverContent>
    </Popover>
  )
}
