import { useNavigate } from "react-router-dom"
import { LogOut } from "lucide-react"
import { useAuthStore } from "@/store/useAuthStore"
import { BrandButton } from "@/components/brand/button"
import { SettingsCard, SettingsHeader, SettingsRow } from "./SettingsCard"

const METHOD = { email: "Email and password", google: "Google" }
const formatDate = (iso) => new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })

export function AccountSection() {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()
  const method = user.app_metadata?.provider

  return (
    <>
      <SettingsHeader title="Account" description="Sign-in details for your LandinPage account." />
      <div className="flex flex-col gap-6">
        <SettingsCard title="Sign-in">
          <SettingsRow label="Email" description="Where we send sign-in links.">
            <p className="truncate text-ui font-medium text-brand-navy">{user.email}</p>
          </SettingsRow>
          <SettingsRow label="Sign-in method">
            <p className="text-ui font-medium text-brand-navy">{METHOD[method] ?? method ?? "Email"}</p>
          </SettingsRow>
          <SettingsRow label="Member since">
            <p className="text-ui font-medium text-brand-navy">{user.created_at ? formatDate(user.created_at) : "-"}</p>
          </SettingsRow>
        </SettingsCard>
        <SettingsCard title="Session">
          <SettingsRow label="Sign out" description="Sign out of LandinPage on this device.">
            <BrandButton
              variant="outline"
              onClick={async () => {
                await signOut()
                navigate("/")
              }}
            >
              <LogOut /> Sign out
            </BrandButton>
          </SettingsRow>
        </SettingsCard>
      </div>
    </>
  )
}
