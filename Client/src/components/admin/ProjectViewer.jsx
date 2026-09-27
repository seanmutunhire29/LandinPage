import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, Wrench } from "lucide-react"
import { adminApi } from "@/lib/api"
import { Segmented } from "@/components/brand/segmented"
import { SettingsCard } from "@/components/settings/SettingsCard"
import { FileIcon } from "@/components/workspace/FileIcon"
import { cn } from "@/lib/utils"
import { AdminData, fmtDate, useAdminData } from "./shared"

const TABS = [
  { id: "chat", label: "Chat" },
  { id: "files", label: "Files" },
  { id: "spec", label: "Design spec" },
]

export function ProjectViewer() {
  const { projectId } = useParams()
  const result = useAdminData(() => adminApi.getProject(projectId), [projectId])
  const [tab, setTab] = useState("chat")

  return (
    <AdminData result={result}>
      {({ project, owner, files, messages }) => (
        <div className="flex flex-col gap-6">
          <div>
            <Link to={`/admin/users/${owner.id}`} className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-muted hover:text-brand-navy">
              <ArrowLeft className="size-3.5" /> {owner.email ?? "Owner"}
            </Link>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl font-semibold text-brand-navy">{project.name}</h1>
                <p className="mt-1 text-sm text-brand-muted">
                  Created {fmtDate(project.created_at, true)} · updated {fmtDate(project.updated_at, true)} · read-only
                </p>
              </div>
              <Segmented options={TABS} value={tab} onChange={setTab} label="View" className="w-80" />
            </div>
          </div>
          {tab === "chat" && <Transcript messages={messages} />}
          {tab === "files" && <Files files={files} />}
          {tab === "spec" && (
            <SettingsCard>
              <pre className="max-h-[70vh] overflow-auto py-5 font-mono text-xs leading-relaxed text-brand-body">
                {JSON.stringify(project.design_spec, null, 2)}
              </pre>
            </SettingsCard>
          )}
        </div>
      )}
    </AdminData>
  )
}

function Transcript({ messages }) {
  if (!messages.length) return <SettingsCard><p className="py-5 text-sm text-brand-subtle">No messages yet.</p></SettingsCard>
  return (
    <SettingsCard>
      <ol className="flex flex-col gap-3 py-5">
        {messages.map((m) =>
          m.role === "tool" ? (
            <li key={m.id}>
              <details className="rounded-xl bg-brand-mist px-3 py-2 text-xs text-brand-muted">
                <summary className="cursor-pointer font-semibold">Tool result</summary>
                <pre className="mt-2 max-h-64 overflow-auto font-mono whitespace-pre-wrap">{m.content}</pre>
              </details>
            </li>
          ) : (
            <li key={m.id} className={cn("flex flex-col gap-1", m.role === "user" && "items-end")}>
              <span className="text-[11px] font-semibold text-brand-subtle">
                {m.role === "user" ? "User" : "Agent"} · {fmtDate(m.created_at, true)}
              </span>
              {m.content?.trim() && (
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap",
                    m.role === "user" ? "bg-brand text-brand-navy" : "bg-brand-fill text-brand-body"
                  )}
                >
                  {m.content}
                </div>
              )}
              {m.tool_calls?.length > 0 && (
                <details className="max-w-[85%] rounded-xl bg-brand-mist px-3 py-2 text-xs text-brand-muted">
                  <summary className="flex cursor-pointer items-center gap-1.5 font-semibold">
                    <Wrench className="size-3" />
                    {m.tool_calls.map((tc) => tc.function?.name).join(", ")}
                  </summary>
                  <pre className="mt-2 max-h-64 overflow-auto font-mono whitespace-pre-wrap">
                    {m.tool_calls.map((tc) => `${tc.function?.name}(${tc.function?.arguments})`).join("\n\n")}
                  </pre>
                </details>
              )}
            </li>
          )
        )}
      </ol>
    </SettingsCard>
  )
}

function Files({ files }) {
  const [active, setActive] = useState(files[0]?.file_path ?? null)
  const file = files.find((f) => f.file_path === active)
  if (!files.length) return <SettingsCard><p className="py-5 text-sm text-brand-subtle">No files yet.</p></SettingsCard>
  return (
    <div className="grid min-h-[60vh] overflow-hidden rounded-[28px] bg-brand-navy md:grid-cols-[240px_minmax(0,1fr)]">
      <ul className="max-h-[70vh] overflow-auto border-r border-white/10 p-2 text-sm">
        {files.map((f) => (
          <li key={f.file_path}>
            <button
              onClick={() => setActive(f.file_path)}
              className={cn(
                "flex h-7 w-full items-center gap-1.5 rounded-lg px-2 text-left",
                f.file_path === active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/[0.06] hover:text-white"
              )}
            >
              <FileIcon path={f.file_path} className="size-3.5 shrink-0" />
              <span className="truncate">{f.file_path}</span>
            </button>
          </li>
        ))}
      </ul>
      <pre className="max-h-[70vh] overflow-auto p-4 font-mono text-xs leading-relaxed text-white/85">{file?.content}</pre>
    </div>
  )
}
