// Resolves the user's choices (falling back to the direction's defaults for
// stages not reached yet) into concrete fonts, colors, and surface styles, and
// into the CSS variables that re-skin shadcn/ui components inside <ThemeScope>.

import { directionById } from "@/data/directions"
import { pairingById } from "@/data/typography"
import { paletteById } from "@/data/palettes"
import { surfaceById, radiusScale } from "@/data/surfaces"
import { fontStack } from "@/lib/fonts"
import { onColor, mix } from "@/lib/color"

export function resolveTheme(state, overrides = {}) {
  const direction = directionById[overrides.direction ?? state.direction]
  if (!direction) return null
  const d = direction.defaults
  const pairing = pairingById[overrides.typography ?? state.typography ?? d.typography]
  const palette = paletteById[overrides.palette ?? state.palette ?? d.palette]
  const surface = surfaceById[overrides.surface ?? state.surface ?? d.surface]
  const c = palette.colors

  const baseRadius = surface.fixedRadius || direction.radius === undefined ? surface.radius : direction.radius
  const radii = radiusScale(baseRadius)
  const headingFont = fontStack(pairing.heading.family, pairing.heading.fallback)
  const bodyFont = fontStack(pairing.body.family, pairing.body.fallback)
  const gradient = palette.gradient ?? `linear-gradient(135deg, ${c.primary}, ${c.accent})`

  const vars = {
    "--background": c.background,
    "--foreground": c.text,
    "--card": c.surface,
    "--card-foreground": c.text,
    "--popover": c.surface,
    "--popover-foreground": c.text,
    "--primary": c.primary,
    "--primary-foreground": onColor(c.primary),
    "--secondary": c.secondary,
    "--secondary-foreground": onColor(c.secondary),
    "--muted": mix(c.surface, c.text, 7),
    "--muted-foreground": c.textMuted,
    "--accent": c.accent,
    "--accent-foreground": onColor(c.accent),
    "--destructive": c.error,
    "--border": c.border,
    "--input": c.border,
    "--ring": c.primary,
    "--radius": `${radii.md}px`,
    "--app-font-body": bodyFont,
    "--app-font-heading": headingFont,
    "--dp-gradient": gradient,
  }

  return {
    direction,
    pairing,
    palette,
    surface,
    colors: c,
    radii,
    gradient,
    headingFont,
    bodyFont,
    vars,
    cardStyle: surface.card(c, palette.gradient),
    controlStyle: surface.control(c, palette.gradient),
    cardClass: surface.className ?? "",
    headingStyle: { fontFamily: headingFont, fontWeight: pairing.heading.weight },
  }
}
