import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { AlertCircle, ArrowLeft, Ban, ChevronRight, ShieldCheck, ShieldOff, Trash2, Undo2 } from "lucide-react"
import { adminApi } from "@/lib/api"
import { useAuthStore } from "@/store/useAuthStore"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SettingsCard, SettingsRow } from "@/components/settings/SettingsCard"
import { UserAvatar } from "@/components/account/UserAvatar"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AdminData, fmtCost, fmtDate, fmtNumber, fmtTokens, Meter, Pill, useAdminData } from "./shared"

export function UserDetail() {
  const { userId } = useParams()
  const result = useAdminData(() => adminApi.getUser(userId), [userId])

  return (
    <>
      <Link to="/admin/users" className="mb-6 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
        <ArrowLeft className="size-3.5" /> All users
      </Link>
      <AdminData result={result}>{(data) => <UserView data={data} onChange={result.setData} />}</AdminData>
    </>
  )
}

function UserView({ data, onChange }) {
  const { user, profile, settings, usage, projects, keys } = data
  const me = useAuthStore((s) => s.user)
  const isSelf = me?.id === user.id
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)
  const [dialog, setDialog] = useState(null) // "suspend" | "delete"

  const act = async (name, fn) => {
    setBusy(name)
    setError(null)
    try {
      const next = await fn()
      if (next) onChange(next)
      return true
    } catch (e) {
      setError(e.message)
      return false
    } finally {
      setBusy(null)
    }
  }

  const name = profile?.display_name || profile?.username || user.email

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <UserAvatar src={profile?.avatar_url} initial={(name || "?")[0].toUpperCase()} className="size-16 text-2xl" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">{name}</h1>
          <p className="text-sm break-words text-muted-foreground">
            {user.email} {profile?.username && `· @${profile.username}`} · signed in with {user.provider || "email"}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {user.is_admin && <Pill tone="brand">Admin</Pill>}
            {settings.suspended_at ? <Pill tone="destructive">Suspended {fmtDate(settings.suspended_at)}</Pill> : <Pill tone="success">Active</Pill>}
            {isSelf && <Pill>You</Pill>}
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {settings.suspended_at && settings.suspended_reason && (
        <Alert variant="destructive">
          <Ban />
          <AlertDescription>Suspension reason: {settings.suspended_reason}</AlertDescription>
        </Alert>
      )}

      <SettingsCard title="Account">
        <SettingsRow label="Joined">{fmtDate(user.created_at, true)}</SettingsRow>
        <SettingsRow label="Last sign-in">{fmtDate(user.last_sign_in_at, true)}</SettingsRow>
        <SettingsRow label="Selected model">
          {settings.provider ? `${settings.provider} · ${settings.model}` : "Default"}
        </SettingsRow>
        <SettingsRow label="Own API keys">
          {keys.length ? keys.map((k) => `${k.provider} ••${k.last4}`).join(", ") : "None"}
        </SettingsRow>
      </SettingsCard>

      <LimitsCard userId={user.id} settings={settings} usage={usage} onSaved={onChange} />

      <SettingsCard title={`Projects (${projects.length})`}>
        {projects.length === 0 ? (
          <p className="py-5 text-sm text-muted-foreground">No projects yet.</p>
        ) : (
          projects.map((p) => (
            <Link
              key={p.id}
              to={`/admin/projects/${p.id}`}
              className="group -mx-2 flex items-center justify-between gap-4 rounded-md px-2 py-3 transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium group-hover:underline group-hover:underline-offset-4">{p.name}</p>
                <p className="text-xs text-muted-foreground">
                  Created {fmtDate(p.created_at)} · updated {fmtDate(p.updated_at)}
                  {p.platform_generation && ` · free generation ${p.platform_generation}`}
                </p>
              </div>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
            </Link>
          ))
        )}
      </SettingsCard>

      <SettingsCard title="Admin actions">
        <SettingsRow label="Admin access" description="Admins can open this dashboard. The user has to sign in again for it to take effect.">
          {user.is_admin ? (
            <Button variant="outline" size="sm" disabled={isSelf || !!busy} onClick={() => act("role", () => adminApi.setRole(user.id, false))}>
              <ShieldOff /> Remove admin
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled={!!busy} onClick={() => act("role", () => adminApi.setRole(user.id, true))}>
              <ShieldCheck /> Make admin
            </Button>
          )}
        </SettingsRow>
        <SettingsRow label="Suspend" description="Blocks sign-in and stops the agent for this account immediately.">
          {settings.suspended_at ? (
            <Button variant="outline" size="sm" disabled={!!busy} onClick={() => act("unsuspend", () => adminApi.unsuspendUser(user.id))}>
              <Undo2 /> Unsuspend
            </Button>
          ) : (
            <Button variant="destructive" size="sm" disabled={isSelf || user.is_admin || !!busy} onClick={() => setDialog("suspend")}>
              <Ban /> Suspend
            </Button>
          )}
        </SettingsRow>
        <SettingsRow label="Delete account" description="Permanently deletes the account, projects, chats and keys.">
          <Button variant="destructive" size="sm" disabled={isSelf || user.is_admin || !!busy} onClick={() => setDialog("delete")}>
            <Trash2 /> Delete
          </Button>
        </SettingsRow>
      </SettingsCard>

      <SuspendDialog
        open={dialog === "suspend"}
        onOpenChange={(o) => !o && setDialog(null)}
        busy={busy === "suspend"}
        onConfirm={async (reason) => (await act("suspend", () => adminApi.suspendUser(user.id, reason))) && setDialog(null)}
      />
      <DeleteDialog open={dialog === "delete"} onOpenChange={(o) => !o && setDialog(null)} email={user.email} userId={user.id} />
    </div>
  )
}

/** "" in a field = use the global default. */
const toField = (v) => (v == null ? "" : String(v))
const fromField = (v) => (v.trim() === "" ? null : Math.max(0, parseInt(v, 10) || 0))

function LimitsCard({ userId, settings, usage, onSaved }) {
  const [free, setFree] = useState(toField(settings.free_generations_limit))
  const [budget, setBudget] = useState(toField(settings.token_budget))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const dirty = free !== toField(settings.free_generations_limit) || budget !== toField(settings.token_budget)

  const save = async (extra = {}) => {
    setSaving(true)
    setError(null)
    try {
      const next = await adminApi.updateUser(userId, { free_generations_limit: fromField(free), token_budget: fromField(budget), ...extra })
      setFree(toField(next.settings.free_generations_limit))
      setBudget(toField(next.settings.token_budget))
      onSaved(next)
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsCard
      title="Usage & limits"
      description="Leave a limit empty to use the platform default. A token budget of 0 means unlimited."
      footer={
        <>
          {error && <span className="mr-auto text-sm text-destructive">{error}</span>}
          <Button variant="ghost" size="sm" disabled={saving} onClick={() => save({ reset_free_generations: true })}>
            Reset free generations
          </Button>
          <Button size="sm" disabled={!dirty || saving} onClick={() => save()}>
            Save limits
          </Button>
        </>
      }
    >
      <SettingsRow label="Free generations" description={settings.free_generations_limit == null ? "Using the platform default." : "Custom limit for this user."}>
        <div className="flex flex-col gap-2">
          <Meter used={settings.free_generations_used} limit={settings.free_generations_limit_effective} />
          <Input inputMode="numeric" aria-label="Free generations limit" value={free} onChange={(e) => setFree(e.target.value.replace(/\D/g, ""))} placeholder="Default" />
        </div>
      </SettingsRow>
      <SettingsRow label="Platform token budget" description={`Prompt + completion tokens on your OpenRouter key. ${settings.token_budget == null ? "Using the platform default." : "Custom budget for this user."}`}>
        <div className="flex flex-col gap-2">
          <Meter used={usage.platform_tokens} limit={settings.token_budget_effective} format={fmtTokens} zeroIsUnlimited />
          <Input inputMode="numeric" aria-label="Platform token budget" value={budget} onChange={(e) => setBudget(e.target.value.replace(/\D/g, ""))} placeholder="Default" />
        </div>
      </SettingsRow>
      <SettingsRow label="Lifetime usage">
        <p className="text-sm text-muted-foreground">
          {fmtNumber(usage.calls)} calls · {fmtTokens(usage.platform_tokens)} platform tokens ({fmtCost(usage.platform_cost)}) · {fmtTokens(usage.user_tokens)} on own keys
        </p>
      </SettingsRow>
    </SettingsCard>
  )
}

function SuspendDialog({ open, onOpenChange, busy, onConfirm }) {
  const [reason, setReason] = useState("")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspend this user?</DialogTitle>
          <DialogDescription>They'll be signed out within the hour and can't sign in or run the agent until you unsuspend them.</DialogDescription>
        </DialogHeader>
        <Input value={reason} aria-label="Suspension reason" onChange={(e) => setReason(e.target.value)} maxLength={200} placeholder="Reason (shown to the user)" />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={busy} onClick={() => onConfirm(reason)}>
            Suspend
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteDialog({ open, onOpenChange, email, userId }) {
  const navigate = useNavigate()
  const [typed, setTyped] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const confirm = async () => {
    setBusy(true)
    setError(null)
    try {
      await adminApi.deleteUser(userId)
      navigate("/admin/users", { replace: true })
    } catch (e) {
      setError(e.message)
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this account?</DialogTitle>
          <DialogDescription>
            This permanently deletes {email} with all their projects, chats and API keys. Type the email to confirm.
          </DialogDescription>
        </DialogHeader>
        <Input value={typed} aria-label="Type the email to confirm" onChange={(e) => setTyped(e.target.value)} placeholder={email} />
        {error && (
          <Alert variant="destructive">
            <AlertCircle />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={busy || typed.trim() !== email} onClick={confirm}>
            Delete forever
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
