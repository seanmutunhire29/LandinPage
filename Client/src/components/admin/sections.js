import { BarChart3, Cpu, FileText, History, Megaphone, Users } from "lucide-react"

export const ADMIN_SECTIONS = [
  { id: "overview", label: "Overview", Icon: BarChart3 },
  { id: "users", label: "Users", Icon: Users },
  { id: "platform", label: "Model & limits", Icon: Cpu },
  { id: "prompt", label: "System prompt", Icon: FileText },
  { id: "announcement", label: "Announcement", Icon: Megaphone },
  { id: "audit", label: "Audit log", Icon: History },
]
