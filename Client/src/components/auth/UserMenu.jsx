import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Cpu, LayoutGrid, LogOut, Settings, UserRound } from "lucide-react"
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
      className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-[#484a5e] transition-colors hover:bg-[#f1f2f8] hover:text-brand-navy"
    >
      <Icon className="size-4 text-[#9699a6]" />
      <span className="flex-1">{children}</span>
      {caption && <span className="max-w-24 truncate text-[11px] font-normal text-[#9699a6]">{caption}</span>}
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
      <PopoverTrigger className="rounded-full ring-2 ring-white outline-none focus-visible:ring-brand/40" aria-label="Account">
        <UserAvatar src={me.avatar} initial={me.initial} className="text-sm" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-1 p-1.5">
        <Link to="/profile" onClick={close} className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-[#f1f2f8]">
          <UserAvatar src={me.avatar} initial={me.initial} className="size-10 text-base" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-brand-navy">{me.name}</p>
            <p className="truncate text-xs text-[#9699a6]">{me.username ? `@${me.username}` : me.email}</p>
          </div>
        </Link>
        <div className="my-1 h-px bg-[#e3e5f0]" />
        <Item to="/profile" Icon={UserRound} onSelect={close}>
          Profile
        </Item>
        <Item to="/projects" Icon={LayoutGrid} onSelect={close}>
          Projects
        </Item>
        <Item to="/settings/models" Icon={Cpu} caption={settings && shortModel(settings.model)} onSelect={close}>
          Models & API keys
        </Item>
        <Item to="/settings/profile" Icon={Settings} onSelect={close}>
          Settings
        </Item>
        <div className="my-1 h-px bg-[#e3e5f0]" />
        <button
          onClick={async () => {
            close()
            await signOut()
            navigate("/")
          }}
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-[#484a5e] transition-colors hover:bg-[#fff0f2] hover:text-[#b3263e]"
        >
          <LogOut className="size-4" /> Sign out
        </button>
      </PopoverContent>
    </Popover>
  )
}
