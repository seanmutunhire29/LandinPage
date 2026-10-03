import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Menu } from "lucide-react"
import { Logo } from "./Logo"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuthStore } from "@/store/useAuthStore"
import { AuthDialog } from "@/components/auth/AuthDialog"
import { UserMenu } from "@/components/auth/UserMenu"

const SECTIONS = [
  { href: "#problem", label: "Why" },
  { href: "#how", label: "How it works" },
]

/** Marketing header: section anchors (a sheet below md), auth entry point and the primary CTA. */
export function Navbar() {
  const user = useAuthStore((s) => s.user)
  const ready = useAuthStore((s) => s.ready)
  const navigate = useNavigate()
  const [authOpen, setAuthOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 md:px-6">
        <Link to="/" aria-label="LandinPage home" className="shrink-0">
          <Logo />
        </Link>

        <NavigationMenu viewport={false} className="hidden md:flex">
          <NavigationMenuList>
            {SECTIONS.map(({ href, label }) => (
              <NavigationMenuItem key={href}>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <a href={href}>{label}</a>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <nav className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <Button asChild variant="ghost">
                <Link to="/profile">My projects</Link>
              </Button>
            ) : (
              ready && (
                <Button variant="ghost" onClick={() => setAuthOpen(true)}>
                  Log in
                </Button>
              )
            )}
          </div>
          <Button asChild>
            <Link to="/onboarding/direction">Get Started</Link>
          </Button>
          <ModeToggle />
          {user && <UserMenu />}

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 px-4">
                {SECTIONS.map(({ href, label }) => (
                  <Button key={href} asChild variant="ghost" className="justify-start">
                    <a href={href} onClick={closeMenu}>
                      {label}
                    </a>
                  </Button>
                ))}
                <Separator className="my-2" />
                {user ? (
                  <Button asChild variant="ghost" className="justify-start">
                    <Link to="/profile" onClick={closeMenu}>
                      My projects
                    </Link>
                  </Button>
                ) : (
                  ready && (
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => {
                        closeMenu()
                        setAuthOpen(true)
                      }}
                    >
                      Log in
                    </Button>
                  )
                )}
                <Button asChild className="mt-2">
                  <Link to="/onboarding/direction" onClick={closeMenu}>
                    Get Started
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        initialMode="login"
        redirectTo={`${window.location.origin}/auth/callback`}
        description="Log in to open your projects, or create an account to get started."
        onAuthenticated={() => {
          setAuthOpen(false)
          navigate("/profile")
        }}
      />
    </header>
  )
}
