import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import { adminApi } from "@/lib/api"
import { SettingsCard, SettingsHeader } from "@/components/settings/SettingsCard"
import { UserAvatar } from "@/components/account/UserAvatar"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminData, fmtDate, fmtNumber, fmtTokens, Meter, Pager, Pill, useAdminData } from "./shared"

export function UserStatus({ user }) {
  return (
    <span className="flex flex-wrap gap-1">
      {user.is_admin && <Pill tone="brand">Admin</Pill>}
      {user.suspended_at ? <Pill tone="destructive">Suspended</Pill> : <Pill tone="success">Active</Pill>}
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
          <InputGroup className="w-44 sm:w-64">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search email, username or name" aria-label="Search users" />
          </InputGroup>
        }
        footer={result.data && <Pager page={page} pageSize={result.data.page_size} total={result.data.total} onPage={setPage} />}
      >
        <AdminData result={result}>
          {({ users }) =>
            users.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No users match.</p>
            ) : (
              <div className="-mx-4 mt-3">
                <Table className="min-w-[860px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-4 text-muted-foreground">User</TableHead>
                      <TableHead className="text-muted-foreground">Joined</TableHead>
                      <TableHead className="text-muted-foreground">Last sign-in</TableHead>
                      <TableHead className="text-right text-muted-foreground">Projects</TableHead>
                      <TableHead className="w-32 pl-6 text-muted-foreground">Free generations</TableHead>
                      <TableHead className="w-32 pl-6 text-muted-foreground">Platform tokens</TableHead>
                      <TableHead className="pr-4 pl-6 text-muted-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow
                        key={u.id}
                        tabIndex={0}
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault()
                            navigate(`/admin/users/${u.id}`)
                          }
                        }}
                        className="cursor-pointer outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
                      >
                        <TableCell className="py-3 pl-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar src={u.avatar_url} initial={(u.display_name || u.email || "?")[0].toUpperCase()} className="size-8 text-xs" />
                            <div className="min-w-0">
                              <p className="truncate font-medium">{u.email}</p>
                              <p className="truncate text-xs text-muted-foreground">
                                {u.username ? `@${u.username}` : "No profile yet"} · {u.provider || "email"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3">{fmtDate(u.created_at)}</TableCell>
                        <TableCell className="py-3">{fmtDate(u.last_sign_in_at)}</TableCell>
                        <TableCell className="py-3 text-right tabular-nums">{fmtNumber(u.projects)}</TableCell>
                        <TableCell className="py-3 pl-6">
                          <Meter used={u.free_generations_used} limit={u.free_generations_limit_effective} />
                        </TableCell>
                        <TableCell className="py-3 pl-6">
                          <Meter used={u.platform_tokens} limit={u.token_budget_effective} format={fmtTokens} zeroIsUnlimited />
                        </TableCell>
                        <TableCell className="py-3 pr-4 pl-6">
                          <UserStatus user={u} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          }
        </AdminData>
      </SettingsCard>
    </>
  )
}
