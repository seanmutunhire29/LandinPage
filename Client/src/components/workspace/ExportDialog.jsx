import { useMemo, useState } from "react"
import { Download, FolderOpen, Loader2 } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { BrandButton } from "@/components/brand/button"
import { buildTree } from "@/lib/fileTree"
import { FileIcon } from "./FileIcon"
import { downloadZip } from "@/lib/exportZip"

const INDENT = 16
const row = "flex h-8 w-full cursor-pointer items-center gap-2 rounded-lg pr-2 text-left transition-colors hover:bg-muted"

const descendants = (node) => [...node.files, ...Object.values(node.dirs).flatMap(descendants)]

const formatSize = (bytes) => (bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1024 ** 2).toFixed(1)} MB`)

function Dir({ node, depth, selected, setMany }) {
  const pad = 8 + depth * INDENT

  return (
    <>
      {Object.entries(node.dirs)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, child]) => {
          const all = descendants(child)
          const count = all.filter((p) => selected.has(p)).length
          const state = count === 0 ? false : count === all.length ? true : "indeterminate"
          return (
            <div key={child.path} role="treeitem" aria-expanded>
              <label className={row} style={{ paddingLeft: pad }}>
                <Checkbox checked={state} onCheckedChange={() => setMany(all, state !== true)} aria-label={`Include ${child.path}`} />
                <FolderOpen className="size-3.5 shrink-0 text-brand-subtle" />
                <span className="truncate font-medium text-brand-navy">{name}</span>
                <span className="ml-auto shrink-0 text-xs text-brand-subtle tabular-nums">
                  {count}/{all.length}
                </span>
              </label>
              <div role="group">
                <Dir node={child} depth={depth + 1} selected={selected} setMany={setMany} />
              </div>
            </div>
          )
        })}
      {node.files.sort().map((path) => (
        <label key={path} role="treeitem" className={row} style={{ paddingLeft: pad }} title={path}>
          <Checkbox checked={selected.has(path)} onCheckedChange={(v) => setMany([path], v === true)} aria-label={`Include ${path}`} />
          <FileIcon path={path} className="text-brand-muted" />
          <span className="truncate text-brand-body">{path.split("/").pop()}</span>
        </label>
      ))}
    </>
  )
}

/** Pick project files and download them as a zip, to keep building in another editor. */
export function ExportDialog({ open, onOpenChange }) {
  const project = useWorkspaceStore((s) => s.project)
  const files = useWorkspaceStore((s) => s.files)
  const paths = useMemo(() => Object.keys(files), [files])
  const tree = useMemo(() => buildTree(paths), [paths])
  const [selected, setSelected] = useState(() => new Set(paths))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [wasOpen, setWasOpen] = useState(open)

  // Start from everything each time the dialog opens, so files added since are included.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setSelected(new Set(paths))
      setError(null)
    }
  }

  const setMany = (list, on) =>
    setSelected((prev) => {
      const next = new Set(prev)
      list.forEach((p) => (on ? next.add(p) : next.delete(p)))
      return next
    })

  const chosen = useMemo(() => paths.filter((p) => selected.has(p)), [paths, selected])
  const size = useMemo(() => {
    const enc = new TextEncoder()
    return chosen.reduce((sum, p) => sum + enc.encode(files[p] ?? "").length, 0)
  }, [chosen, files])

  const download = async () => {
    setBusy(true)
    setError(null)
    try {
      await downloadZip(project?.name, files, chosen)
      onOpenChange(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-[39px] p-7 shadow-float ring-0">
        <DialogHeader>
          <DialogTitle>Download project</DialogTitle>
          <DialogDescription>
            Choose the files to include. Unzip, run <code className="rounded-md bg-muted px-1 py-px font-mono text-xs text-brand-navy">npm install</code>, and keep building in any editor.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-hidden rounded-2xl shadow-clay-sm">
          <div className="flex items-center gap-3 border-b border-border bg-brand-mist px-3 py-2 text-xs">
            <span className="mr-auto text-brand-muted tabular-nums">
              {chosen.length} of {paths.length} files · {formatSize(size)}
            </span>
            <button onClick={() => setSelected(new Set(paths))} className="font-medium text-brand-dark hover:underline">
              Select all
            </button>
            <button onClick={() => setSelected(new Set())} className="font-medium text-brand-muted hover:text-brand-navy hover:underline">
              Clear
            </button>
          </div>
          <div role="tree" aria-label="Files to download" className="max-h-80 overflow-y-auto p-1 font-mono text-sm">
            {paths.length ? (
              <Dir node={tree} depth={0} selected={selected} setMany={setMany} />
            ) : (
              <p className="py-8 text-center font-sans text-sm text-brand-subtle">This project has no files yet.</p>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-destructive">Couldn't create the zip: {error}</p>}

        <div className="flex justify-end gap-2">
          <BrandButton variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </BrandButton>
          <BrandButton onClick={download} disabled={!chosen.length || busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Download />}
            Download .zip
          </BrandButton>
        </div>
      </DialogContent>
    </Dialog>
  )
}
