import { useEffect, useRef, useState } from "react"
import { ArrowUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function Kbd({ children }) {
  return <kbd className="rounded border bg-muted px-1 font-mono text-xs text-muted-foreground">{children}</kbd>
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
        "relative overflow-hidden rounded-xl border border-input bg-background shadow-xs transition-[color,box-shadow] dark:bg-input/30",
        busy ? "border-ring ring-3 ring-ring/30" : "focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        className
      )}
    >
      {busy && (
        <span className="absolute inset-x-0 top-0 h-0.5 overflow-hidden" aria-hidden>
          <span className="block h-full w-2/5 animate-[dp-sweep_1.4s_ease-in-out_infinite] rounded-full bg-primary" />
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
        className="block max-h-60 min-h-12 w-full resize-none bg-transparent px-3 pt-3 pb-1 text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        aria-label="Message"
      />
      <div className={cn("@container flex items-center gap-2 px-2 pb-2", toolbar ? "pl-2" : "pl-3")}>
        {toolbar}
        <div className="min-w-0 flex-1 text-xs" aria-live="polite">
          {busy ? (
            <span className="flex min-w-0 items-center gap-1.5 font-medium text-foreground">
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inset-0 animate-ping rounded-full bg-primary/40" />
                <span className="relative size-2 rounded-full bg-primary" />
              </span>
              <span className="truncate">{activity ?? "Working"}</span>
            </span>
          ) : (
            <span className={cn("items-center gap-1 text-muted-foreground", toolbar ? "hidden justify-end @sm:flex" : "flex")}>
              <Kbd>Enter</Kbd> to send <span className="px-0.5">·</span> <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd> new line
            </span>
          )}
        </div>
        <Button type="submit" size="icon" disabled={!ready} aria-label={busy ? "Agent is working" : "Send"}>
          {busy ? <Loader2 className="animate-spin" /> : <ArrowUp />}
        </Button>
      </div>
    </form>
  )
}
