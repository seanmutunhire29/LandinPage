import { useMemo, useState } from "react"
import { AlertCircle, Download, FolderOpen, Loader2 } from "lucide-react"
import { useWorkspaceStore } from "@/store/useWorkspaceStore"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { buildTree } from "@/lib/fileTree"
import { FileIcon } from "./FileIcon"
import { downloadZip } from "@/lib/exportZip"

const INDENT = 16
const row = "h-8 w-full cursor-pointer rounded-md pr-2 text-left font-normal transition-colors hover:bg-accent/50"

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
              <Label className={row} style={{ paddingLeft: pad }}>
                <Checkbox checked={state} onCheckedChange={() => setMany(all, state !== true)} aria-label={`Include ${child.path}`} />
                <FolderOpen className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate font-medium text-foreground">{name}</span>
                <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
                  {count}/{all.length}
                </span>
              </Label>
              <div role="group">
                <Dir node={child} depth={depth + 1} selected={selected} setMany={setMany} />
              </div>
            </div>
          )
        })}
      {node.files.sort().map((path) => (
        <Label key={path} role="treeitem" className={row} style={{ paddingLeft: pad }} title={path}>
          <Checkbox checked={selected.has(path)} onCheckedChange={(v) => setMany([path], v === true)} aria-label={`Include ${path}`} />
          <FileIcon path={path} />
          <span className="truncate text-foreground">{path.split("/").pop()}</span>
        </Label>
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Download project</DialogTitle>
          <DialogDescription>
            Choose the files to include. Unzip, run <code className="rounded-md bg-muted px-1 py-px font-mono text-xs text-foreground">npm install</code>, and keep building in any editor.
          </DialogDescription>
        </DialogHeader>

        <div className="min-w-0 overflow-hidden rounded-lg border">
          <div className="flex items-center gap-1 border-b bg-muted/50 py-1 pr-1 pl-3 text-xs">
            <span className="mr-auto text-muted-foreground tabular-nums">
              {chosen.length} of {paths.length} files · {formatSize(size)}
            </span>
            <Button variant="ghost" size="xs" onClick={() => setSelected(new Set(paths))}>
              Select all
            </Button>
            <Button variant="ghost" size="xs" className="text-muted-foreground" onClick={() => setSelected(new Set())}>
              Clear
            </Button>
          </div>
          <div role="tree" aria-label="Files to download" className="max-h-80 overflow-y-auto p-1 font-mono text-sm">
            {paths.length ? (
              <Dir node={tree} depth={0} selected={selected} setMany={setMany} />
            ) : (
              <p className="py-8 text-center font-sans text-sm text-muted-foreground">This project has no files yet.</p>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>Couldn't create the zip: {error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={download} disabled={!chosen.length || busy}>
            {busy ? <Loader2 className="animate-spin" /> : <Download />}
            Download .zip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
