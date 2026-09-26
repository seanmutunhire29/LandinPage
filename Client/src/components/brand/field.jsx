import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Filled text fields for app chrome: a soft pressed-in clay well with no border,
 * brightening to white with a brand ring on focus. `fieldVariants` also styles wrappers that hold an
 * input plus an icon or prefix (use `focus-within` there).
 */
const fieldVariants = cva(
  "w-full min-w-0 rounded-2xl border-0 bg-brand-fill text-brand-navy shadow-clay-inset transition-[background-color,box-shadow] duration-200 outline-none placeholder:text-brand-subtle focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-brand/30 has-[input:focus-visible]:bg-white has-[input:focus-visible]:ring-4 has-[input:focus-visible]:ring-brand/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive/40",
  {
    variants: {
      size: {
        md: "h-10 px-3.5 text-ui",
        sm: "h-8 rounded-xl px-3 text-sm",
        area: "px-3.5 py-2.5 text-ui leading-relaxed",
      },
    },
    defaultVariants: { size: "md" },
  }
)

function BrandInput({ className, size, ...props }) {
  return <input data-slot="brand-input" className={cn(fieldVariants({ size }), className)} {...props} />
}

function BrandTextarea({ className, ...props }) {
  return <textarea data-slot="brand-textarea" className={cn(fieldVariants({ size: "area" }), "block resize-none", className)} {...props} />
}

export { BrandInput, BrandTextarea, fieldVariants }
