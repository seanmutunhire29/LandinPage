import { useState } from "react"
import { Link } from "react-router-dom"
import { ChevronDown, KeyRound } from "lucide-react"
import { hasKey, providerById, useAccountStore } from "@/store/useAccountStore"
import { ProviderTile } from "@/components/account/UserAvatar"
import { ModelOptions } from "@/components/settings/ModelOptions"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { shortModel } from "@/lib/providers"

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
        className="inline-flex h-7 max-w-44 min-w-0 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-accent aria-expanded:text-accent-foreground"
        aria-label={`Model: ${current?.label} ${settings.model}`}
      >
        <ProviderTile provider={settings.provider} className="size-4.5 rounded text-[9px]" />
        <span className="truncate">{shortModel(settings.model)}</span>
        <ChevronDown className="size-3 shrink-0 text-muted-foreground" />
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="flex h-[26rem] w-80 flex-col gap-2 p-2">
        <Tabs value={shown.id} onValueChange={setViewing} className="min-h-0 flex-1">
          <TabsList aria-label="Provider" className="w-full group-data-horizontal/tabs:h-auto">
            {providers.map((p) => (
              <TabsTrigger key={p.id} value={p.id} title={p.label} className="flex-col gap-1 py-1.5 text-xs">
                <ProviderTile provider={p.id} className="size-6 rounded-md text-xs" />
                {p.label}
                {hasKey(settings, p.id) && <span className="absolute top-1 right-1.5 size-1.5 rounded-full bg-success" aria-label="key connected" />}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={shown.id} className="flex min-h-0 flex-col gap-2">
            {!shownKey && (
              <Link
                to="/settings/models"
                className="flex items-center gap-2 rounded-md border bg-card px-2 py-1.5 text-xs text-warning transition-colors outline-none hover:bg-accent/50 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <KeyRound className="size-3.5 shrink-0" /> No {shown.label} key yet. <span className="font-medium underline">Add key</span>
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
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
