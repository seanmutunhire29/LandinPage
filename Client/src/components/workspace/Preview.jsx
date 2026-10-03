import { useLayoutEffect, useRef, useState } from "react"
import { AlertTriangle, ExternalLink, Monitor, RotateCw, Smartphone, Tablet } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { reloadPreview } from "@/webcontainer/runtime"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { BuildProgress } from "./BuildProgress"

// Viewport sizes the preview is rendered at. Desktop has no fixed height: it fills the
// panel, and only falls back to scaling when the panel is narrower than its width.
const DEVICES = [
  { id: "mobile", label: "Mobile", Icon: Smartphone, width: 390, height: 844, radius: 36 },
  { id: "tablet", label: "Tablet", Icon: Tablet, width: 768, height: 1024, radius: 24 },
  { id: "desktop", label: "Desktop", Icon: Monitor, width: 1280 },
]

const STAGE_PAD = 24
const CAPTION_H = 28

function useElementSize(ref) {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setSize({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return size
}

/**
 * Lays out the iframe at the device's real CSS width (so the app's media queries see a
 * phone, tablet or desktop viewport) and scales it down to fit the available space.
 */
function frameFor(device, stage) {
  if (!stage.width || !stage.height) return { width: device.width, height: device.height ?? 800, scale: 1 }
  if (!device.height) {
    const width = Math.max(stage.width, device.width)
    const scale = stage.width / width
    return { width, height: stage.height / scale, scale }
  }
  const scale = Math.min(
    1,
    (stage.width - STAGE_PAD * 2) / device.width,
    (stage.height - STAGE_PAD * 2 - CAPTION_H) / device.height
  )
  return { width: device.width, height: device.height, scale: Math.max(scale, 0.1) }
}

export function Preview() {
  const url = useWorkspaceStore((s) => s.previewUrl)
  const runtime = useWorkspaceStore((s) => s.runtime)
  const [deviceId, setDeviceId] = useState("desktop")
  const stageRef = useRef(null)
  const stage = useElementSize(stageRef)

  const device = DEVICES.find((d) => d.id === deviceId)
  const framed = Boolean(device.height)
  const frame = frameFor(device, stage)

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <TooltipProvider>
        <div className="flex h-11 shrink-0 items-center gap-2 border-b bg-background px-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" onClick={reloadPreview} disabled={!url} aria-label="Reload preview">
                <RotateCw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reload preview</TooltipContent>
          </Tooltip>
          <div className="min-w-0 flex-1 truncate rounded-md bg-muted px-3 py-1 font-mono text-xs text-muted-foreground">{url ?? "localhost"}</div>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            spacing={0}
            value={deviceId}
            onValueChange={(v) => v && setDeviceId(v)}
            aria-label="Preview device"
            className="shrink-0"
          >
            {DEVICES.map(({ id, label, Icon }) => (
              <ToggleGroupItem key={id} value={id} aria-label={label} title={label}>
                <Icon />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button asChild variant="ghost" size="icon-sm">
                <a
                  href={url ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
                  aria-disabled={!url}
                  aria-label="Open preview in new tab"
                >
                  <ExternalLink />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open preview in new tab</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
      <div ref={stageRef} className={cn("relative min-h-0 flex-1 overflow-hidden", framed && "bg-muted/50")}>
        {url && (
          <div className={cn("flex size-full flex-col items-center", framed && "justify-center gap-2")}>
            <div
              className={cn(
                "relative shrink-0 overflow-hidden bg-background transition-[width,height,border-radius] duration-300 ease-out",
                framed && "border shadow-sm"
              )}
              style={{
                width: frame.width * frame.scale,
                height: frame.height * frame.scale,
                borderRadius: framed ? device.radius * frame.scale : 0,
              }}
            >
              <iframe
                key={url}
                src={url}
                title="Live preview"
                className="absolute top-0 left-0 origin-top-left border-0"
                style={{ width: frame.width, height: frame.height, transform: `scale(${frame.scale})` }}
                allow="clipboard-write"
              />
            </div>
            {framed && (
              <p className="h-5 font-mono text-xs text-muted-foreground">
                {device.width} × {device.height}
                {frame.scale < 1 && ` · ${Math.round(frame.scale * 100)}%`}
              </p>
            )}
          </div>
        )}
        {!url && (
          <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-muted/50 p-6 text-center">
            {runtime.status === "error" ? (
              <div className="flex max-w-sm flex-col items-center gap-2 text-sm text-muted-foreground">
                <AlertTriangle className="size-6 text-destructive" />
                <p className="font-semibold text-foreground">Preview unavailable</p>
                <p>{runtime.error}</p>
              </div>
            ) : (
              <BuildProgress />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
