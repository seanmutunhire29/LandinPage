import { Logo } from "./Logo"

export function Footer() {
  return (
    <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-10 text-center text-sm text-brand-muted md:flex-row md:px-8 md:text-left">
      <Logo />
      <p>Landing page design decisions, compiled into a spec. Everything stays in your browser.</p>
    </footer>
  )
}
