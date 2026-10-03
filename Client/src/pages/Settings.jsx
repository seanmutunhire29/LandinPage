import { Navigate, useParams } from "react-router-dom"
import { AlertCircle, Loader2 } from "lucide-react"
import { useAccountStore } from "@/store/useAccountStore"
import { SettingsLayout } from "@/components/settings/SettingsLayout"
import { SECTIONS } from "@/components/settings/sections"
import { ProfileSection } from "@/components/settings/ProfileSection"
import { ModelsSection } from "@/components/settings/ModelsSection"
import { AccountSection } from "@/components/settings/AccountSection"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

const CONTENT = { profile: ProfileSection, models: ModelsSection, account: AccountSection }

export default function Settings() {
  const { section = "profile" } = useParams()
  const status = useAccountStore((s) => s.status)
  const error = useAccountStore((s) => s.error)
  const load = useAccountStore((s) => s.load)
  if (!SECTIONS.some((s) => s.id === section)) return <Navigate to="/settings/profile" replace />
  const Section = CONTENT[section]
  // The account section only needs the auth session.
  const needsAccount = section !== "account"

  return (
    <SettingsLayout>
      {needsAccount && status === "error" ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertDescription className="flex flex-col items-start gap-3">
            <p>Couldn't load your settings: {error}</p>
            <Button variant="outline" onClick={load}>
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      ) : needsAccount && status !== "ready" ? (
        <div className="grid place-items-center py-24">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Section />
      )}
    </SettingsLayout>
  )
}
