// Compiles the store into the three-part build spec defined at the end of
// Categories.md: tokens, composition, content.

import { SPACING_SCALES } from "@/data/directions"
import { motionById } from "@/data/motion"
import { sectionById } from "@/data/sections"
import { categoryName } from "@/data/typography"
import { moodName } from "@/data/palettes"
import { resolveTheme } from "@/lib/theme"

const scaleDurations = (scale, factor = 1) =>
  Object.fromEntries(Object.entries(scale).map(([k, ms]) => [k, Math.round(ms * factor)]))

export function buildSpec(state) {
  const theme = resolveTheme(state)
  if (!theme) return null
  const { direction, pairing, palette, surface, colors, radii } = theme
  const motion = motionById[state.motion ?? direction.defaults.motion]
  const { id: _id, name: _name, blurb: _blurb, demo: _demo, durationScale, ...motionExtras } = motion

  return {
    meta: {
      tool: "LandinPage",
      specVersion: "0.1.0",
      scope: "landing-page",
      direction: { id: direction.id, name: direction.name },
      generatedAt: new Date().toISOString(),
    },
    tokens: {
      typography: {
        category: { id: pairing.category, name: categoryName[pairing.category] },
        pairing: pairing.id,
        headingFont: { family: pairing.heading.family, weight: pairing.heading.weight, fallback: pairing.heading.fallback, source: "Google Fonts" },
        bodyFont: { family: pairing.body.family, weight: pairing.body.weight, fallback: pairing.body.fallback, source: "Google Fonts" },
        typeScale: { ratio: pairing.ratio, unit: "px", steps: pairing.scale },
      },
      color: {
        palette: { id: palette.id, name: palette.name, mood: moodName[palette.mood], source: palette.source },
        roles: colors,
        gradient: palette.gradient ?? null,
        scheme: palette.dark ? "dark" : "light",
      },
      spacingScale: { unit: "px", density: direction.spacing, steps: SPACING_SCALES[direction.spacing] },
      surface: surface.id,
      radiusScale: { unit: "px", ...radii },
      shadowStyle: surface.shadow(colors, palette.gradient),
      borderStyle: surface.border(colors, palette.gradient),
      ...(surface.borderGradient ? { borderGradient: surface.borderGradient(colors, palette.gradient) } : {}),
      blurAmount: surface.blur,
      texture: surface.texture ? { enabled: true, type: "grain" } : { enabled: false },
      motion: {
        preset: motion.id,
        durationScale: { unit: "ms", ...scaleDurations(durationScale, direction.motionTiming ?? 1) },
        ...motionExtras,
      },
      components: { ...state.components },
    },
    composition: {
      sections: state.sections.map((s, order) => ({
        order,
        type: s.type,
        variant: s.variant,
        contentBearing: Boolean(sectionById[s.type]?.contentBearing),
        componentOverrides: {},
      })),
    },
    content: {
      status: "placeholder",
      note: "The content stage is not designed yet. Copy for each section will be filled in here.",
      sections: state.sections.map((s) => ({ type: s.type, copy: {} })),
    },
  }
}
