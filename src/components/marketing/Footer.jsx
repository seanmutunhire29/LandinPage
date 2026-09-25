import { Logo } from "./Logo"

export function Footer() {
  return (
    <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-[#676879] md:flex-row md:px-8">
      <Logo />
      <p>Landing page design decisions, compiled into a spec. Everything stays in your browser.</p>
    </footer>
  )
}
