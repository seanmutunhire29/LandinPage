// Stage 1: Typography. Every option is a pairing of real Google Fonts, plus a
// modular type scale and weight range. `body.class` is used by directions that
// constrain the body face (Editorial → humanist body, Art Deco → geometric body).

export const TYPE_CATEGORIES = [
  { id: "geometric", name: "Geometric sans" },
  { id: "humanist", name: "Humanist sans" },
  { id: "grotesk", name: "Grotesk sans" },
  { id: "condensed", name: "Condensed sans" },
  { id: "rounded", name: "Rounded sans" },
  { id: "expressive", name: "Variable / expressive sans" },
  { id: "mono", name: "Monospace" },
  { id: "serif-transitional", name: "Serif, transitional" },
  { id: "serif-oldstyle", name: "Serif, old-style" },
  { id: "serif-display", name: "Serif, high-contrast display" },
  { id: "slab", name: "Slab serif" },
  { id: "slab-display", name: "Slab serif, display weight" },
  { id: "script", name: "Script / handwritten accent" },
  { id: "display", name: "Display / decorative" },
  { id: "pixel", name: "Pixel / bitmap" },
  { id: "stencil", name: "Stencil" },
]

export const SCALE_STEPS = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "display"]

const RATIOS = {
  "minor-third": 1.2,
  "major-third": 1.25,
  "perfect-fourth": 1.333,
  "augmented-fourth": 1.414,
  "perfect-fifth": 1.5,
}

/**
 * 8-step scale from label text to hero headline, base 16px. Steps below the
 * base use at most a 1.2 ratio so small labels stay legible on steep scales.
 */
export function buildScale(ratioName, base = 16) {
  const r = RATIOS[ratioName]
  return Object.fromEntries(
    SCALE_STEPS.map((step, i) => {
      const n = i - 2
      return [step, Math.round(base * (n < 0 ? Math.min(r, 1.2) : r) ** n)]
    })
  )
}

const p = (id, category, heading, body, ratio, extra = {}) => ({
  id,
  category,
  heading: { family: heading[0], weight: heading[1], fallback: heading[2] ?? "sans-serif" },
  body: { family: body[0], weight: body[1] ?? 400, class: body[2], fallback: body[3] ?? "sans-serif" },
  ratio,
  ...extra,
})

export const PAIRINGS = [
  // Geometric sans
  p("poppins-inter", "geometric", ["Poppins", 700], ["Inter", 400, "humanist"], "major-third"),
  p("outfit-dmsans", "geometric", ["Outfit", 700], ["DM Sans", 400, "geometric"], "perfect-fourth"),
  p("jost", "geometric", ["Jost", 700], ["Jost", 400, "geometric"], "perfect-fourth"),

  // Humanist sans
  p("inter", "humanist", ["Inter", 700], ["Inter", 400, "humanist"], "major-third"),
  p("fira-sans", "humanist", ["Fira Sans", 700], ["Fira Sans", 400, "humanist"], "major-third"),
  p("source-sans", "humanist", ["Source Sans 3", 600], ["Source Sans 3", 400, "humanist"], "minor-third"),

  // Grotesk sans (thin variants are what Dark Luxury calls "thin-weight grotesk")
  p("spacegrotesk-inter", "grotesk", ["Space Grotesk", 700], ["Inter", 400, "humanist"], "perfect-fourth"),
  p("intertight-inter", "grotesk", ["Inter Tight", 600], ["Inter", 400, "humanist"], "perfect-fourth"),
  p("archivo", "grotesk", ["Archivo", 800], ["Archivo", 400, "grotesk"], "perfect-fourth"),
  p("hanken-light", "grotesk", ["Hanken Grotesk", 200], ["Hanken Grotesk", 300, "grotesk"], "augmented-fourth", { thin: true }),
  p("worksans-light", "grotesk", ["Work Sans", 200], ["Work Sans", 300, "grotesk"], "augmented-fourth", { thin: true }),

  // Condensed sans
  p("bebas-barlow", "condensed", ["Bebas Neue", 400], ["Barlow", 400, "grotesk"], "perfect-fifth"),
  p("oswald-sourcesans", "condensed", ["Oswald", 700], ["Source Sans 3", 400, "humanist"], "perfect-fourth"),
  p("saira-sharetech", "condensed", ["Saira Condensed", 700], ["Share Tech Mono", 400, "mono", "monospace"], "perfect-fourth"),

  // Rounded sans
  p("nunito", "rounded", ["Nunito", 800], ["Nunito Sans", 400, "humanist"], "major-third"),
  p("quicksand-mulish", "rounded", ["Quicksand", 700], ["Mulish", 400, "humanist"], "major-third"),
  p("fredoka-nunito", "rounded", ["Fredoka", 600], ["Nunito", 400, "humanist"], "perfect-fourth"),

  // Variable / expressive sans
  p("syne-dmsans", "expressive", ["Syne", 800], ["DM Sans", 400, "geometric"], "perfect-fifth"),
  p("bricolage-inter", "expressive", ["Bricolage Grotesque", 800], ["Inter", 400, "humanist"], "perfect-fifth"),
  p("unbounded-manrope", "expressive", ["Unbounded", 700], ["Manrope", 400, "geometric"], "augmented-fourth"),

  // Monospace
  p("jetbrains-plex", "mono", ["JetBrains Mono", 800, "monospace"], ["IBM Plex Sans", 400, "grotesk"], "perfect-fourth"),
  p("plexmono", "mono", ["IBM Plex Mono", 600, "monospace"], ["IBM Plex Mono", 400, "mono", "monospace"], "major-third"),
  p("spacemono-spacegrotesk", "mono", ["Space Mono", 700, "monospace"], ["Space Grotesk", 400, "grotesk"], "perfect-fourth"),

  // Serif, transitional
  p("baskerville-sourcesans", "serif-transitional", ["Libre Baskerville", 700, "serif"], ["Source Sans 3", 400, "humanist"], "perfect-fourth"),
  p("sourceserif-inter", "serif-transitional", ["Source Serif 4", 600, "serif"], ["Inter", 400, "humanist"], "perfect-fourth"),
  p("merriweather", "serif-transitional", ["Merriweather", 700, "serif"], ["Merriweather", 400, "serif", "serif"], "major-third"),

  // Serif, old-style
  p("garamond-fira", "serif-oldstyle", ["EB Garamond", 600, "serif"], ["Fira Sans", 400, "humanist"], "perfect-fourth"),
  p("lora-sourcesans", "serif-oldstyle", ["Lora", 600, "serif"], ["Source Sans 3", 400, "humanist"], "major-third"),
  p("crimson", "serif-oldstyle", ["Crimson Pro", 600, "serif"], ["Crimson Pro", 400, "serif", "serif"], "major-third"),
  p("newsreader", "serif-oldstyle", ["Newsreader", 600, "serif"], ["Newsreader", 400, "serif", "serif"], "minor-third"),

  // Serif, high-contrast display
  p("playfair-lato", "serif-display", ["Playfair Display", 700, "serif"], ["Lato", 400, "humanist"], "augmented-fourth"),
  p("fraunces-inter", "serif-display", ["Fraunces", 600, "serif"], ["Inter", 400, "humanist"], "augmented-fourth"),
  p("cormorant-manrope", "serif-display", ["Cormorant Garamond", 500, "serif"], ["Manrope", 300, "geometric"], "perfect-fifth"),
  p("bodoni-josefin", "serif-display", ["Bodoni Moda", 600, "serif"], ["Josefin Sans", 400, "geometric"], "perfect-fifth"),
  p("dmserif-dmsans", "serif-display", ["DM Serif Display", 400, "serif"], ["DM Sans", 400, "geometric"], "augmented-fourth"),

  // Slab serif
  p("robotoslab-roboto", "slab", ["Roboto Slab", 700, "serif"], ["Roboto", 400, "grotesk"], "major-third"),
  p("zilla-sourcesans", "slab", ["Zilla Slab", 700, "serif"], ["Source Sans 3", 400, "humanist"], "perfect-fourth"),
  p("bitter", "slab", ["Bitter", 700, "serif"], ["Bitter", 400, "serif", "serif"], "major-third"),

  // Slab serif, display weight
  p("alfa-worksans", "slab-display", ["Alfa Slab One", 400, "serif"], ["Work Sans", 400, "grotesk"], "perfect-fifth"),
  p("ultra-karla", "slab-display", ["Ultra", 400, "serif"], ["Karla", 400, "grotesk"], "perfect-fifth"),

  // Script / handwritten accent (always paired with a plain sans body)
  p("pacifico-poppins", "script", ["Pacifico", 400, "cursive"], ["Poppins", 400, "geometric"], "perfect-fourth"),
  p("mrdafoe-montserrat", "script", ["Mr Dafoe", 400, "cursive"], ["Montserrat", 400, "geometric"], "perfect-fifth"),
  p("caveat-inter", "script", ["Caveat", 600, "cursive"], ["Inter", 400, "humanist"], "perfect-fourth"),

  // Display / decorative
  p("rubikmono-rubik", "display", ["Rubik Mono One", 400], ["Rubik", 400, "geometric"], "perfect-fourth"),
  p("monoton-spacegrotesk", "display", ["Monoton", 400], ["Space Grotesk", 400, "grotesk"], "perfect-fifth"),
  p("bungee-worksans", "display", ["Bungee", 400], ["Work Sans", 400, "grotesk"], "perfect-fourth"),
  p("orbitron-exo", "display", ["Orbitron", 700], ["Exo 2", 400, "geometric"], "perfect-fourth"),
  p("anton-archivo", "display", ["Anton", 400], ["Archivo", 400, "grotesk"], "perfect-fifth"),

  // Pixel / bitmap
  p("pressstart-spacemono", "pixel", ["Press Start 2P", 400, "monospace"], ["Space Mono", 400, "mono", "monospace"], "major-third"),
  p("silkscreen-jetbrains", "pixel", ["Silkscreen", 400, "monospace"], ["JetBrains Mono", 400, "mono", "monospace"], "perfect-fourth"),
  p("pixelify-inter", "pixel", ["Pixelify Sans", 600], ["Inter", 400, "humanist"], "perfect-fourth"),

  // Stencil
  p("sairastencil-saira", "stencil", ["Saira Stencil One", 400], ["Saira", 400, "grotesk"], "perfect-fourth"),
  p("stardos-barlow", "stencil", ["Stardos Stencil", 700], ["Barlow", 400, "grotesk"], "perfect-fourth"),
].map((pair) => ({
  ...pair,
  name: pair.heading.family === pair.body.family ? pair.heading.family : `${pair.heading.family} / ${pair.body.family}`,
  scale: buildScale(pair.ratio),
}))

export const pairingById = Object.fromEntries(PAIRINGS.map((x) => [x.id, x]))
export const categoryName = Object.fromEntries(TYPE_CATEGORIES.map((c) => [c.id, c.name]))
