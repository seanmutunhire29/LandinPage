import { Navbar } from "@/components/marketing/Navbar"
import { Hero } from "@/components/marketing/Hero"
import { LogoMarquee } from "@/components/marketing/LogoMarquee"
import { Problem } from "@/components/marketing/Problem"
import { HowItWorks } from "@/components/marketing/HowItWorks"
import { CtaBand } from "@/components/marketing/CtaBand"
import { Footer } from "@/components/marketing/Footer"

export default function Marketing() {
  return (
    <div className="min-h-svh bg-background">
      <Navbar />
      <main>
        <Hero />
        <LogoMarquee />
        <Problem />
        <HowItWorks />
        <CtaBand />
      </main>
      <Footer />
    </div>
  )
}
