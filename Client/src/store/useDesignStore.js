import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  typographyOptions,
  paletteOptions,
  surfaceOptions,
  componentOptions,
  sectionVariantOptions,
  motionOptions,
} from "@/lib/filters"
import { sectionById } from "@/data/sections"

const initialSections = () => [
  { type: "hero", variant: null },
  { type: "footer", variant: null },
]

const initialState = {
  direction: null,
  typography: null,
  palette: null,
  surface: null,
  components: {},
  sections: initialSections(),
  motion: null,
}

const keepIf = (id, options) => (id && options.some((o) => o.id === id) ? id : null)

/**
 * Drops any downstream selection that is no longer in its stage's filtered set
 * (e.g. after the user goes back and changes direction). Locked surfaces are
 * set automatically, since the direction decides them.
 */
function sanitize(state) {
  const d = state.direction
  if (!d) return { ...initialState, sections: initialSections() }

  const surfaces = surfaceOptions(d)
  const components = Object.fromEntries(
    Object.entries(state.components).filter(([cat, id]) => keepIf(id, componentOptions(d, cat)))
  )
  return {
    typography: keepIf(state.typography, typographyOptions(d)),
    palette: keepIf(state.palette, paletteOptions(d)),
    surface: surfaces.length === 1 ? surfaces[0].id : keepIf(state.surface, surfaces),
    components,
    sections: state.sections.map((s) => ({
      ...s,
      variant: keepIf(s.variant, sectionVariantOptions(d, s.type)),
    })),
    motion: keepIf(state.motion, motionOptions(d)),
  }
}

export const useDesignStore = create(
  persist(
    (set) => ({
      ...initialState,

      setDirection: (direction) => set((s) => ({ direction, ...sanitize({ ...s, direction }) })),
      setTypography: (typography) => set({ typography }),
      setPalette: (palette) => set({ palette }),
      setSurface: (surface) => set({ surface }),
      setComponent: (category, variant) =>
        set((s) => ({ components: { ...s.components, [category]: variant } })),
      setMotion: (motion) => set({ motion }),

      toggleSection: (type) =>
        set((s) => {
          if (sectionById[type]?.required) return {}
          if (s.sections.some((x) => x.type === type)) {
            return { sections: s.sections.filter((x) => x.type !== type) }
          }
          // New sections go just before the footer.
          const sections = [...s.sections]
          sections.splice(sections.length - 1, 0, { type, variant: null })
          return { sections }
        }),
      setSectionVariant: (type, variant) =>
        set((s) => ({
          sections: s.sections.map((x) => (x.type === type ? { ...x, variant } : x)),
        })),
      reorderSections: (sections) => set({ sections }),

      reset: () => set({ ...initialState, sections: initialSections() }),
    }),
    { name: "landinpage-selections", version: 1 }
  )
)
