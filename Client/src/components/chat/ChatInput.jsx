import { useEffect, useRef, useState } from "react"
import { ArrowUp, Loader2 } from "lucide-react"
import { brandButtonVariants } from "@/components/brand/button"
import { cn } from "@/lib/utils"

function Kbd({ children }) {
  return <kbd className="rounded-lg bg-white px-1.5 font-sans shadow-clay-sm text-xs font-semibold text-brand-muted">{children}</kbd>
}

/**
 * Auto-growing textarea. Enter sends, Shift+Enter adds a newline. While `busy`
 * the card shows what the agent is doing (`activity`) and typing stays open so
 * the next message can be drafted; sending waits until the turn ends.
 */
export function ChatInput({ onSubmit, busy = false, activity, disabled = false, placeholder, autoFocus, className, initialValue = "", toolbar }) {
  const [value, setValue] = useState(initialValue)
  const ref = useRef(null)
  const ready = Boolean(value.trim()) && !busy && !disabled

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`
  }, [value])

  const submit = () => {
    if (!ready) return
    onSubmit(value.trim())
    setValue("")
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      data-busy={busy || undefined}
      className={cn(
        "relative overflow-hidden rounded-[26px] bg-brand-fill shadow-clay-inset transition-[background-color,box-shadow] duration-200",
        busy ? "ring-2 ring-brand/40" : "focus-within:bg-white focus-within:ring-4 focus-within:ring-brand/30",
        className
      )}
    >
      {busy && (
        <span className="absolute inset-x-0 top-0 h-0.5 overflow-hidden" aria-hidden>
          <span className="block h-full w-2/5 animate-[dp-sweep_1.4s_ease-in-out_infinite] rounded-full bg-brand" />
        </span>
      )}
      <textarea
        ref={ref}
        rows={1}
        value={value}
        autoFocus={autoFocus}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            submit()
          }
        }}
        placeholder={busy ? "Draft your next change while it works..." : placeholder}
        className="block max-h-60 min-h-12 w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-ui leading-relaxed text-brand-navy outline-none placeholder:text-brand-subtle disabled:opacity-50"
        aria-label="Message"
      />
      <div className={cn("@container flex items-center gap-2 px-2 pb-2", toolbar ? "pl-2" : "pl-3.5")}>
        {toolbar}
        <div className="min-w-0 flex-1 text-xs" aria-live="polite">
          {busy ? (
            <span className="flex min-w-0 items-center gap-1.5 font-semibold text-brand-dark">
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inset-0 animate-ping rounded-full bg-brand/50" />
                <span className="relative size-2 rounded-full bg-brand" />
              </span>
              <span className="truncate">{activity ?? "Working"}</span>
            </span>
          ) : (
            <span className={cn("items-center gap-1 text-brand-subtle", toolbar ? "hidden justify-end @sm:flex" : "flex")}>
              <Kbd>Enter</Kbd> to send <span className="px-0.5">·</span> <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd> new line
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={!ready}
          className={cn(
            brandButtonVariants({ size: "icon" }),
            "disabled:opacity-100",
            ready && "shadow-brand-sm active:scale-95",
            !ready && busy && "bg-brand/10 text-brand-dark",
            !ready && !busy && "bg-secondary text-brand/35"
          )}
          aria-label={busy ? "Agent is working" : "Send"}
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" strokeWidth={2.5} />}
        </button>
      </div>
    </form>
  )
}
