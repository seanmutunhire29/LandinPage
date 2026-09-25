import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronDown, KeyRound } from "lucide-react"
import { hasKey, providerById, useAccountStore } from "@/store/useAccountStore"
import { ProviderTile } from "@/components/account/UserAvatar"
import { ModelOptions } from "@/components/settings/ModelOptions"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { shortModel } from "@/lib/providers"
import { cn } from "@/lib/utils"

/** Compact provider/model switcher for the chat box. Changes the account-wide default. */
export function ModelPicker() {
  const settings = useAccountStore((s) => s.settings)
  const providers = useAccountStore((s) => s.providers)
  const selectModel = useAccountStore((s) => s.selectModel)
  const [open, setOpen] = useState(false)
  const [viewing, setViewing] = useState(null)
  if (!settings || providers.length === 0) return null

  const current = providerById(providers, settings.provider)
  const shown = providerById(providers, viewing ?? settings.provider) ?? current
  const shownKey = settings.keys.find((k) => k.provider === shown.id)

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) setViewing(null)
      }}
    >
      <PopoverTrigger
        className="inline-flex h-7 max-w-44 min-w-0 items-center gap-1.5 rounded-md px-1.5 text-[12px] font-medium text-[#484a5e] transition-colors outline-none hover:bg-[#f1f2f8] focus-visible:ring-2 focus-visible:ring-brand/40 aria-expanded:bg-[#f1f2f8]"
        aria-label={`Model: ${current?.label} ${settings.model}`}
      >
        <ProviderTile provider={settings.provider} className="size-4.5 rounded text-[9px]" />
        <span className="truncate">{shortModel(settings.model)}</span>
        <ChevronDown className="size-3 shrink-0 text-[#9699a6]" />
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="h-[26rem] w-80 gap-2 p-1.5">
        <div className="flex gap-1 border-b border-[#eef0f5] px-0.5 pb-2" role="tablist" aria-label="Provider">
          {providers.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={p.id === shown.id}
              title={p.label}
              onClick={() => setViewing(p.id)}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 rounded-md py-1.5 text-[10px] font-semibold transition-colors",
                p.id === shown.id ? "bg-[#eef0fb] text-brand-navy" : "text-[#9699a6] hover:bg-[#f6f7fb]"
              )}
            >
              <ProviderTile provider={p.id} className="size-6 rounded-md text-[11px]" />
              {p.label}
              {hasKey(settings, p.id) && <span className="absolute top-1 right-1.5 size-1.5 rounded-full bg-brand-green" aria-label="key connected" />}
            </button>
          ))}
        </div>
        {!shownKey && (
          <Link
            to="/settings/models"
            className="mx-0.5 flex items-center gap-2 rounded-md bg-[#fffaeb] px-2 py-1.5 text-[12px] text-[#8a6100] ring-1 ring-[#fde9b3] hover:bg-[#fff4d1]"
          >
            <KeyRound className="size-3.5 shrink-0" /> No {shown.label} key yet. <span className="font-semibold underline">Add key</span>
          </Link>
        )}
        <ModelOptions
          key={shown.id}
          provider={shown}
          value={shown.id === settings.provider ? settings.model : null}
          keyStamp={shownKey?.updated_at}
          onSelect={(model) => {
            selectModel(shown.id, model).catch(() => {})
            setOpen(false)
          }}
          className="min-h-0 flex-1"
        />
      </PopoverContent>
    </Popover>
  )
}
