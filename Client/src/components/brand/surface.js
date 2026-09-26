import { cva } from "class-variance-authority"

/**
 * White clay card on the mist app background: puffy shadow, no border. `interactive`
 * adds the springy hover-scale and press bounce.
 */
export const surfaceVariants = cva("bg-white shadow-clay", {
  variants: {
    radius: {
      lg: "rounded-[39px]",
      md: "rounded-[26px]",
    },
    interactive: {
      true: "transition-[transform,box-shadow] duration-200 ease-spring hover:scale-[1.02] hover:shadow-float active:scale-[0.98]",
    },
  },
  defaultVariants: { radius: "lg" },
})
