import { useEffect, useRef, useState } from "react"
import { ArrowUp, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

/** Auto-growing textarea. Enter sends, Shift+Enter adds a newline. */
export function ChatInput({ onSubmit, busy = false, disabled = false, placeholder, autoFocus, className, initialValue = "" }) {
  const [value, setValue] = useState(initialValue)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`
  }, [value])

  const submit = () => {
    const text = value.trim()
    if (!text || busy || disabled) return
    onSubmit(text)
    setValue("")
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className={cn("flex items-end gap-2 rounded-2xl bg-white p-2 ring-1 ring-[#e3e5f0] focus-within:ring-2 focus-within:ring-brand/40", className)}
    >
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
        placeholder={placeholder}
        className="max-h-60 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-brand-navy outline-none placeholder:text-[#9699a6] disabled:opacity-50"
        aria-label="Message"
      />
      <button
        type="submit"
        disabled={!value.trim() || busy || disabled}
        className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-dark disabled:bg-[#d7d9e6]"
        aria-label="Send"
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
      </button>
    </form>
  )
}
