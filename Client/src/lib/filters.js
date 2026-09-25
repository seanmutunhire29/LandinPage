// Stage filtering: given the user's direction, return only the options that the
// direction marks as compatible (per Categories.md). Strict: there is no
// "show all" override.

import { directionById } from "@/data/directions"
import { PAIRINGS } from "@/data/typography"
import { PALETTES } from "@/data/palettes"
import { surfaceById } from "@/data/surfaces"
import { componentCategoryById, COMPONENT_CATEGORIES } from "@/data/components"
import { sectionById } from "@/data/sections"
import { motionById } from "@/data/motion"

function matchesTypeRule(pairing, rule) {
  if (typeof rule === "string") return pairing.category === rule && !pairing.thin
  if (pairing.category !== rule.cat) return false
  if (rule.body && pairing.body.class !== rule.body) return false
  if (rule.thin !== undefined && Boolean(pairing.thin) !== rule.thin) return false
  return true
}

export function typographyOptions(directionId) {
  const d = directionById[directionId]
  if (!d) return []
  return PAIRINGS.filter((p) => d.typography.some((rule) => matchesTypeRule(p, rule)))
}

export function paletteOptions(directionId) {
  const d = directionById[directionId]
  if (!d) return []
  return PALETTES.filter((p) =>
    d.palettes.some((rule) => {
      const [mood, tag] = rule.split(":")
      return p.mood === mood && (!tag || p.tags?.includes(tag))
    })
  )
}

export function surfaceOptions(directionId) {
  const d = directionById[directionId]
  return d ? d.surfaces.map((id) => surfaceById[id]) : []
}

export const isSurfaceLocked = (directionId) => surfaceOptions(directionId).length === 1

export function componentOptions(directionId, categoryId) {
  const d = directionById[directionId]
  const cat = componentCategoryById[categoryId]
  if (!d || !cat) return []
  const excluded = d.components.exclude?.[categoryId] ?? []
  return cat.variants.filter((v) => !excluded.includes(v.id))
}

export function sectionVariantOptions(directionId, sectionId) {
  const d = directionById[directionId]
  const section = sectionById[sectionId]
  if (!d || !section) return []
  const exclude = d.sections.exclude ?? []
  const prefer = d.sections.prefer ?? []
  const allowed = section.variants.filter((v) => !v.tags.some((t) => exclude.includes(t)))
  const score = (v) => (v.tags.some((t) => prefer.includes(t)) ? 0 : 1)
  return [...allowed].sort((a, b) => score(a) - score(b))
}

/** The direction's recommended variant for a section: the first after preference sorting. */
export const recommendedSectionVariant = (directionId, sectionId) =>
  sectionVariantOptions(directionId, sectionId)[0]?.id

export function motionOptions(directionId) {
  const d = directionById[directionId]
  return d ? d.motion.map((id) => motionById[id]) : []
}

export function recommendedFor(directionId, key) {
  return directionById[directionId]?.defaults[key]
}

export const COMPONENT_IDS = COMPONENT_CATEGORIES.map((c) => c.id)
