import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

/** Primary CTA that starts the onboarding wizard. */
export function GetStartedButton({ className, variant = "default", size = "lg", children = "Get Started" }) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link to="/onboarding/direction">
        {children}
        <ArrowRight data-icon="inline-end" />
      </Link>
    </Button>
  )
}
