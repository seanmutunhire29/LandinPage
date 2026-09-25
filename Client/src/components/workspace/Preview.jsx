import { AlertTriangle, ExternalLink, RotateCw } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { reloadPreview } from "@/webcontainer/runtime"
import { BuildProgress } from "./BuildProgress"

export function Preview() {
  const url = useWorkspaceStore((s) => s.previewUrl)
  const runtime = useWorkspaceStore((s) => s.runtime)

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-[#e3e5f0] bg-[#f6f7fb] px-2">
        <button onClick={reloadPreview} disabled={!url} className="grid size-7 place-items-center rounded-md text-[#676879] hover:bg-white disabled:opacity-40" aria-label="Reload preview">
          <RotateCw className="size-3.5" />
        </button>
        <div className="min-w-0 flex-1 truncate rounded-md bg-white px-2.5 py-1 font-mono text-[11px] text-[#676879] ring-1 ring-[#e3e5f0]">
          {url ?? "localhost"}
        </div>
        <a
          href={url ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="grid size-7 place-items-center rounded-md text-[#676879] hover:bg-white aria-disabled:pointer-events-none aria-disabled:opacity-40"
          aria-disabled={!url}
          aria-label="Open preview in new tab"
        >
          <ExternalLink className="size-3.5" />
        </a>
      </div>
      <div className="relative min-h-0 flex-1">
        {url && <iframe key={url} src={url} title="Live preview" className="size-full border-0" allow="clipboard-write" />}
        {!url && (
          <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-brand-mist p-6 text-center">
            {runtime.status === "error" ? (
              <div className="flex max-w-sm flex-col items-center gap-2 text-sm text-[#676879]">
                <AlertTriangle className="size-6 text-brand-red" />
                <p className="font-semibold text-brand-navy">Preview unavailable</p>
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
