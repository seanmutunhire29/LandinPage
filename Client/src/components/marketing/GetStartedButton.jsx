import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

export function GetStartedButton({ className, variant = "brand", children = "Get Started" }) {
  return (
    <Link
      to="/onboarding/direction"
      className={cn(
        "group inline-flex h-14 items-center gap-2 rounded-full px-8 font-display text-lg font-semibold transition-all",
        "hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:outline-none",
        variant === "brand" && "bg-brand text-white shadow-[0_10px_30px_-10px_rgba(97,97,255,0.8)] hover:bg-brand-dark focus-visible:ring-brand/30",
        variant === "navy" && "bg-brand-navy text-white hover:bg-black focus-visible:ring-brand-navy/30",
        className
      )}
    >
      {children}
      <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
    </Link>
  )
}
