import { Navigate, useParams } from "react-router-dom"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { ADMIN_SECTIONS } from "@/components/admin/sections"
import { OverviewSection } from "@/components/admin/OverviewSection"
import { UsersSection } from "@/components/admin/UsersSection"
import { UserDetail } from "@/components/admin/UserDetail"
import { ProjectViewer } from "@/components/admin/ProjectViewer"
import { PlatformSection } from "@/components/admin/PlatformSection"
import { PromptSection } from "@/components/admin/PromptSection"
import { AnnouncementSection } from "@/components/admin/AnnouncementSection"
import { AuditSection } from "@/components/admin/AuditSection"

const CONTENT = {
  overview: OverviewSection,
  users: UsersSection,
  platform: PlatformSection,
  prompt: PromptSection,
  announcement: AnnouncementSection,
  audit: AuditSection,
}

/** /admin/:section, /admin/users/:userId and /admin/projects/:projectId. */
export default function Admin({ view }) {
  const { section } = useParams()
  let content
  if (view === "user") content = <UserDetail />
  else if (view === "project") content = <ProjectViewer />
  else if (!ADMIN_SECTIONS.some((s) => s.id === section)) return <Navigate to="/admin/overview" replace />
  else {
    const Section = CONTENT[section]
    content = <Section />
  }
  return <AdminLayout>{content}</AdminLayout>
}
