import { useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, ChevronRight, Wrench } from "lucide-react"
import { adminApi } from "@/lib/api"
import { SettingsCard } from "@/components/settings/SettingsCard"
import { FileIcon } from "@/components/workspace/FileIcon"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
        <Tabs value={tab} onValueChange={setTab} className="gap-6">
          <div>
            <Link
              to={`/admin/users/${owner.id}`}
              className="mb-6 inline-flex max-w-full items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ArrowLeft className="size-3.5 shrink-0" /> <span className="truncate">{owner.email ?? "Owner"}</span>
            </Link>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight break-words md:text-3xl">{project.name}</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Created {fmtDate(project.created_at, true)} · updated {fmtDate(project.updated_at, true)} · read-only
                </p>
              </div>
              <TabsList aria-label="View">
                {TABS.map((t) => (
                  <TabsTrigger key={t.id} value={t.id} className="px-3">
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>
          <TabsContent value="chat">
            <Transcript messages={messages} />
          </TabsContent>
          <TabsContent value="files">
            <Files files={files} />
          </TabsContent>
          <TabsContent value="spec">
            <SettingsCard>
              <pre className="max-h-[70vh] overflow-auto py-5 font-mono text-xs leading-relaxed">{JSON.stringify(project.design_spec, null, 2)}</pre>
            </SettingsCard>
          </TabsContent>
        </Tabs>
      )}
    </AdminData>
  )
}

/** Collapsible block for tool calls and results in the transcript. */
function ToolBlock({ title, children, className }) {
  return (
    <Collapsible className={cn("rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground", className)}>
      <CollapsibleTrigger className="group/trigger flex w-full min-w-0 items-center gap-1.5 rounded-sm text-left font-medium outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
        <ChevronRight className="size-3.5 shrink-0 transition-transform group-data-[state=open]/trigger:rotate-90" />
        {title}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <pre className="mt-2 max-h-64 overflow-auto font-mono whitespace-pre-wrap">{children}</pre>
      </CollapsibleContent>
    </Collapsible>
  )
}

function Transcript({ messages }) {
  if (!messages.length)
    return (
      <SettingsCard>
        <p className="py-5 text-sm text-muted-foreground">No messages yet.</p>
      </SettingsCard>
    )
  return (
    <SettingsCard>
      <ol className="flex flex-col gap-3 py-5">
        {messages.map((m) =>
          m.role === "tool" ? (
            <li key={m.id}>
              <ToolBlock title="Tool result">{m.content}</ToolBlock>
            </li>
          ) : (
            <li key={m.id} className={cn("flex flex-col gap-1", m.role === "user" && "items-end")}>
              <span className="text-xs text-muted-foreground">
                {m.role === "user" ? "User" : "Agent"} · {fmtDate(m.created_at, true)}
              </span>
              {m.content?.trim() && (
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm wrap-anywhere whitespace-pre-wrap",
                    m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                  )}
                >
                  {m.content}
                </div>
              )}
              {m.tool_calls?.length > 0 && (
                <ToolBlock
                  className="w-full max-w-[85%]"
                  title={
                    <>
                      <Wrench className="size-3 shrink-0" />
                      <span className="truncate">{m.tool_calls.map((tc) => tc.function?.name).join(", ")}</span>
                    </>
                  }
                >
                  {m.tool_calls.map((tc) => `${tc.function?.name}(${tc.function?.arguments})`).join("\n\n")}
                </ToolBlock>
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
  if (!files.length)
    return (
      <SettingsCard>
        <p className="py-5 text-sm text-muted-foreground">No files yet.</p>
      </SettingsCard>
    )
  return (
    <div className="grid min-h-[60vh] overflow-hidden rounded-xl border bg-muted/40 md:grid-cols-[240px_minmax(0,1fr)]">
      <ScrollArea className="max-h-48 border-b md:max-h-[70vh] md:border-r md:border-b-0 [&>[data-slot=scroll-area-viewport]]:max-h-[inherit] [&>[data-slot=scroll-area-viewport]>div]:block!">
        <ul className="p-2 text-sm">
          {files.map((f) => (
            <li key={f.file_path}>
              <button
                type="button"
                onClick={() => setActive(f.file_path)}
                aria-current={f.file_path === active || undefined}
                className={cn(
                  "flex h-7 w-full min-w-0 items-center gap-1.5 rounded-md px-2 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  f.file_path === active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                )}
              >
                <FileIcon path={f.file_path} className="size-3.5 shrink-0" />
                <span className="truncate">{f.file_path}</span>
              </button>
            </li>
          ))}
        </ul>
      </ScrollArea>
      {/* Native scrolling so long code lines can scroll sideways. */}
      <pre className="max-h-[70vh] min-w-0 overflow-auto bg-background/60 p-4 font-mono text-xs leading-relaxed">{file?.content}</pre>
    </div>
  )
}
