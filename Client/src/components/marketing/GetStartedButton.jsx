import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { brandButtonVariants } from "@/components/brand/button"
import { cn } from "@/lib/utils"

export function GetStartedButton({ className, variant = "brand", children = "Get Started" }) {
  return (
    <Link to="/onboarding/direction" className={cn(brandButtonVariants({ variant, size: "xl" }), "group", className)}>
      {children}
      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}
