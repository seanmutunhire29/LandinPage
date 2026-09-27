import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import { adminApi } from "@/lib/api"
import { fieldVariants } from "@/components/brand/field"
import { SettingsCard, SettingsHeader } from "@/components/settings/SettingsCard"
import { UserAvatar } from "@/components/account/UserAvatar"
import { cn } from "@/lib/utils"
import { AdminData, fmtDate, fmtNumber, fmtTokens, Meter, Pager, Pill, useAdminData } from "./shared"

export function UserStatus({ user }) {
  return (
    <span className="flex flex-wrap gap-1">
      {user.is_admin && <Pill tone="brand">Admin</Pill>}
      {user.suspended_at ? <Pill tone="danger">Suspended</Pill> : <Pill tone="success">Active</Pill>}
    </span>
  )
}

export function UsersSection() {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const result = useAdminData(() => adminApi.listUsers({ search, page }), [search, page])

  // Debounce typing into the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query.trim())
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  return (
    <>
      <SettingsHeader title="Users" description="Everyone who has created an account, newest first." />
      <SettingsCard
        title={result.data ? `${fmtNumber(result.data.total)} ${result.data.total === 1 ? "user" : "users"}` : "Users"}
        action={
          <label className={cn(fieldVariants({ size: "sm" }), "flex w-64 items-center gap-2")}>
            <Search className="size-3.5 text-brand-subtle" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search email, username or name"
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-brand-subtle"
            />
          </label>
        }
        footer={result.data && <Pager page={page} pageSize={result.data.page_size} total={result.data.total} onPage={setPage} />}
      >
        <AdminData result={result}>
          {({ users }) =>
            users.length === 0 ? (
              <p className="py-8 text-center text-sm text-brand-subtle">No users match.</p>
            ) : (
              <div className="-mx-card overflow-x-auto">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="text-left text-xs text-brand-subtle">
                    <tr className="border-b border-border">
                      <th className="py-3 pl-card font-semibold">User</th>
                      <th className="py-3 font-semibold">Joined</th>
                      <th className="py-3 font-semibold">Last sign-in</th>
                      <th className="py-3 text-right font-semibold">Projects</th>
                      <th className="w-32 py-3 pl-6 font-semibold">Free generations</th>
                      <th className="w-32 py-3 pl-6 font-semibold">Platform tokens</th>
                      <th className="py-3 pr-card pl-6 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-brand-body">
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                        className="cursor-pointer transition-colors hover:bg-brand-mist"
                      >
                        <td className="py-3 pl-card">
                          <div className="flex items-center gap-3">
                            <UserAvatar src={u.avatar_url} initial={(u.display_name || u.email || "?")[0].toUpperCase()} className="size-8 text-xs" />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-brand-navy">{u.email}</p>
                              <p className="truncate text-xs text-brand-subtle">
                                {u.username ? `@${u.username}` : "No profile yet"} · {u.provider || "email"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 whitespace-nowrap">{fmtDate(u.created_at)}</td>
                        <td className="py-3 whitespace-nowrap">{fmtDate(u.last_sign_in_at)}</td>
                        <td className="py-3 text-right tabular-nums">{fmtNumber(u.projects)}</td>
                        <td className="py-3 pl-6">
                          <Meter used={u.free_generations_used} limit={u.free_generations_limit_effective} />
                        </td>
                        <td className="py-3 pl-6">
                          <Meter used={u.platform_tokens} limit={u.token_budget_effective} format={fmtTokens} zeroIsUnlimited />
                        </td>
                        <td className="py-3 pr-card pl-6">
                          <UserStatus user={u} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </AdminData>
      </SettingsCard>
    </>
  )
}
