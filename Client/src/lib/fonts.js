// Weights listed here must exist for each Google Fonts family, otherwise the
// CSS2 API rejects the whole request. Each family gets its own <link> so one
// bad request can never block the others.
const FONT_WEIGHTS = {
  "Alfa Slab One": "400",
  Anton: "400",
  Archivo: "400;600;800",
  Barlow: "400;500;700",
  "Bebas Neue": "400",
  Bitter: "400;700",
  "Bodoni Moda": "400;600;700",
  "Bricolage Grotesque": "300;500;800",
  Bungee: "400",
  Caveat: "600",
  "Cormorant Garamond": "300;500;600",
  "Crimson Pro": "400;600",
  "DM Sans": "400;500;700",
  "DM Serif Display": "400",
  "EB Garamond": "400;600",
  "Exo 2": "400;600",
  "Fira Sans": "400;500;700",
  Fraunces: "400;600;800",
  Fredoka: "400;600",
  "Hanken Grotesk": "200;300;400",
  "IBM Plex Mono": "400;600",
  "IBM Plex Sans": "400;500",
  Inter: "300;400;500;600;700",
  "Inter Tight": "500;600;700",
  "JetBrains Mono": "400;700;800",
  "Josefin Sans": "400;600",
  Jost: "400;500;700",
  Karla: "400;600",
  Lato: "400;700",
  "Libre Baskerville": "400;700",
  Lora: "400;600",
  Manrope: "300;400;600",
  Merriweather: "400;700",
  Monoton: "400",
  Montserrat: "400;600",
  "Mr Dafoe": "400",
  Mulish: "400;600",
  Newsreader: "400;600",
  Nunito: "400;700;800",
  "Nunito Sans": "400;600",
  Orbitron: "500;700",
  Oswald: "500;700",
  Outfit: "400;600;700",
  Pacifico: "400",
  "Pixelify Sans": "400;600",
  "Playfair Display": "400;700",
  Poppins: "400;600;700",
  "Press Start 2P": "400",
  Quicksand: "500;700",
  Roboto: "400;500",
  "Roboto Slab": "400;700",
  Rubik: "400;500",
  "Rubik Mono One": "400",
  Saira: "400;500",
  "Saira Condensed": "500;700",
  "Saira Stencil One": "400",
  "Share Tech Mono": "400",
  Silkscreen: "400",
  "Source Sans 3": "400;600",
  "Source Serif 4": "400;600",
  "Space Grotesk": "400;500;700",
  "Space Mono": "400;700",
  "Stardos Stencil": "400;700",
  Syne: "500;700;800",
  Ultra: "400",
  Unbounded: "500;700",
  "Work Sans": "200;300;400;500",
  "Zilla Slab": "500;700",
}

const loaded = new Set()

export function loadFont(family) {
  if (!family || loaded.has(family) || typeof document === "undefined") return
  loaded.add(family)
  const weights = FONT_WEIGHTS[family] ?? "400;700"
  const link = document.createElement("link")
  link.rel = "stylesheet"
  link.href = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weights}&display=swap`
  document.head.appendChild(link)
}

export function loadPairing(pairing) {
  if (!pairing) return
  loadFont(pairing.heading.family)
  loadFont(pairing.body.family)
}

export function fontStack(family, fallback = "sans-serif") {
  return `"${family}", ${fallback}`
}

export { FONT_WEIGHTS }
