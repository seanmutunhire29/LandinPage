import { Logo } from "./Logo"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-center text-sm text-muted-foreground md:flex-row md:px-6 md:text-left">
        <Logo />
        <p>Landing page design decisions, compiled into a spec. Everything stays in your browser.</p>
      </div>
    </footer>
  )
}
