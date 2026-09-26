import { cva } from "class-variance-authority"
import { Slot } from "radix-ui"
import { cn } from "@/lib/utils"

/**
 * LandinPage's own pill button: puffy clay with a springy hover-scale and press
 * bounce. Use this for app chrome; components/ui/button stays neutral so <ThemeScope> previews can re-skin it.
 */
const brandButtonVariants = cva(
  "group/brand-button inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-bold whitespace-nowrap transition-[transform,box-shadow,background-color,color] duration-200 ease-spring outline-none hover:scale-[1.03] active:scale-95 select-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        brand: "bg-brand text-brand-navy shadow-brand-sm focus-visible:ring-brand/40",
        navy: "bg-brand-navy text-white shadow-[8px_8px_18px_rgb(59_7_100/0.3),inset_-4px_-4px_10px_rgb(0_0_0/0.25),inset_4px_4px_10px_rgb(255_255_255/0.18)] focus-visible:ring-brand-navy/30",
        outline: "bg-white text-brand-navy shadow-clay-sm ring-2 ring-brand/50 ring-inset hover:ring-brand focus-visible:ring-brand/40",
        ghost: "text-brand-muted hover:bg-brand-fill hover:text-brand-navy focus-visible:ring-brand/30",
        danger: "text-danger hover:bg-danger-soft focus-visible:ring-danger/20",
      },
      size: {
        xl: "h-14 px-8 font-display text-lg font-semibold [&_svg:not([class*='size-'])]:size-5",
        lg: "h-11 px-6 text-ui",
        md: "h-10 px-5 text-ui",
        sm: "h-8 gap-1.5 px-3.5 text-sm [&_svg:not([class*='size-'])]:size-3.5",
        icon: "size-9",
        "icon-sm": "size-8 [&_svg:not([class*='size-'])]:size-3.5",
      },
    },
    compoundVariants: [{ variant: "brand", size: "xl", className: "shadow-brand" }],
    defaultVariants: { variant: "brand", size: "md" },
  }
)

function BrandButton({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot.Root : "button"
  return <Comp data-slot="brand-button" className={cn(brandButtonVariants({ variant, size }), className)} {...props} />
}

export { BrandButton, brandButtonVariants }
