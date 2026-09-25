// Stage 2: Color palettes. Each palette is a full semantic role map drawn from
// an established source (editor themes, Tailwind CSS scales, brand systems,
// standard named colors), never arbitrary hex values. `source` records where it
// comes from. `tags` let a direction narrow within a mood (e.g. Art Deco takes
// only the gold variant of the black/gold-or-jewel mood).

export const MOODS = [
  { id: "mono-accent", name: "Monochrome + single accent" },
  { id: "muted", name: "Muted / desaturated multi-color" },
  { id: "vibrant", name: "Saturated / vibrant multi-color" },
  { id: "neon-dark", name: "Neon on dark" },
  { id: "pastel", name: "Pastel" },
  { id: "earth", name: "Earth tones" },
  { id: "black-luxe", name: "Black / gold or black / jewel-tone" },
  { id: "ink-paper", name: "Ink-and-paper" },
  { id: "duotone", name: "Duotone" },
  { id: "gradient", name: "Gradient-heavy" },
  { id: "bwr", name: "High-contrast black / white / red" },
  { id: "jewel-light", name: "Jewel tones on light" },
  { id: "sunset", name: "Sunset / warm gradient" },
  { id: "cool-tech", name: "Cool tech blue-purple" },
  { id: "gray-neon", name: "Grayscale with one neon pop" },
  { id: "sepia", name: "Vintage sepia / muted warm" },
]

const TW_STATUS = { success: "#16A34A", warning: "#D97706", error: "#DC2626" }

export const PALETTES = [
  // Monochrome + single accent
  {
    id: "swiss-red", mood: "mono-accent", name: "Swiss Red",
    source: "Tailwind CSS neutral + red-600",
    colors: { primary: "#DC2626", secondary: "#171717", accent: "#FEE2E2", background: "#FFFFFF", surface: "#FAFAFA", text: "#0A0A0A", textMuted: "#737373", border: "#E5E5E5", ...TW_STATUS, error: "#B91C1C" },
  },
  {
    id: "slate-blue", mood: "mono-accent", name: "Slate & Blue",
    source: "Tailwind CSS slate + blue-600",
    colors: { primary: "#2563EB", secondary: "#0F172A", accent: "#DBEAFE", background: "#FFFFFF", surface: "#F8FAFC", text: "#0F172A", textMuted: "#64748B", border: "#E2E8F0", ...TW_STATUS },
  },
  {
    id: "soft-indigo", mood: "mono-accent", name: "Soft Gray Indigo", tags: ["soft"],
    source: "Classic neumorphism base #E0E5EC + Tailwind indigo-500",
    colors: { primary: "#6366F1", secondary: "#A3B1C6", accent: "#C7D2FE", background: "#E0E5EC", surface: "#E0E5EC", text: "#31344B", textMuted: "#6B7280", border: "#CBD2DC", success: "#22C55E", warning: "#F59E0B", error: "#EF4444" },
  },

  // Muted / desaturated multi-color
  {
    id: "nord", mood: "muted", name: "Nord Snow Storm",
    source: "Nord (Snow Storm, Frost, Aurora)",
    colors: { primary: "#5E81AC", secondary: "#81A1C1", accent: "#88C0D0", background: "#ECEFF4", surface: "#E5E9F0", text: "#2E3440", textMuted: "#4C566A", border: "#D8DEE9", success: "#A3BE8C", warning: "#EBCB8B", error: "#BF616A" },
  },
  {
    id: "rose-pine-dawn", mood: "muted", name: "Rosé Pine Dawn",
    source: "Rosé Pine Dawn",
    colors: { primary: "#286983", secondary: "#907AA9", accent: "#D7827E", background: "#FAF4ED", surface: "#FFFAF3", text: "#575279", textMuted: "#797593", border: "#DFDAD9", success: "#56949F", warning: "#EA9D34", error: "#B4637A" },
  },

  // Saturated / vibrant multi-color
  {
    id: "pop-primary", mood: "vibrant", name: "Primary Triad", tags: ["primary"],
    source: "Classic Bauhaus primaries (#D02C2F / #F4C430 / #1D4E89)",
    colors: { primary: "#D02C2F", secondary: "#1D4E89", accent: "#F4C430", background: "#F5F1E6", surface: "#FFFFFF", text: "#111111", textMuted: "#555555", border: "#111111", success: "#2E7D32", warning: "#F4C430", error: "#D02C2F" },
  },
  {
    id: "electric", mood: "vibrant", name: "Electric",
    source: "Tailwind CSS violet-600, pink-500, yellow-400",
    colors: { primary: "#7C3AED", secondary: "#EC4899", accent: "#FACC15", background: "#FFFFFF", surface: "#FAF5FF", text: "#18181B", textMuted: "#52525B", border: "#E4E4E7", success: "#22C55E", warning: "#F97316", error: "#EF4444" },
  },

  // Neon on dark
  {
    id: "dracula", mood: "neon-dark", name: "Dracula", dark: true,
    source: "Dracula theme spec",
    colors: { primary: "#BD93F9", secondary: "#FF79C6", accent: "#8BE9FD", background: "#282A36", surface: "#343746", text: "#F8F8F2", textMuted: "#A1A8C9", border: "#44475A", success: "#50FA7B", warning: "#FFB86C", error: "#FF5555" },
  },
  {
    id: "tokyo-night", mood: "neon-dark", name: "Tokyo Night", dark: true,
    source: "Tokyo Night theme",
    colors: { primary: "#7AA2F7", secondary: "#BB9AF7", accent: "#7DCFFF", background: "#1A1B26", surface: "#24283B", text: "#C0CAF5", textMuted: "#737AA2", border: "#414868", success: "#9ECE6A", warning: "#E0AF68", error: "#F7768E" },
  },
  {
    id: "synthwave", mood: "neon-dark", name: "Synthwave '84", dark: true,
    source: "SynthWave '84 theme",
    gradient: "linear-gradient(135deg, #FF7EDB 0%, #36F9F6 100%)",
    colors: { primary: "#FF7EDB", secondary: "#36F9F6", accent: "#FEDE5D", background: "#262335", surface: "#34294F", text: "#FFFFFF", textMuted: "#A8ADD8", border: "#495495", success: "#72F1B8", warning: "#FEDE5D", error: "#FE4450" },
  },

  // Pastel
  {
    id: "sorbet", mood: "pastel", name: "Sorbet",
    source: "Tailwind CSS violet-400, pink-300, green-300, fuchsia-50",
    colors: { primary: "#A78BFA", secondary: "#F9A8D4", accent: "#86EFAC", background: "#FDF4FF", surface: "#FFFFFF", text: "#3B0764", textMuted: "#6B6280", border: "#F5D0FE", success: "#4ADE80", warning: "#FCD34D", error: "#FB7185" },
  },
  {
    id: "mint-peach", mood: "pastel", name: "Mint & Peach",
    source: "Tailwind CSS teal-300, orange-300, amber-200",
    colors: { primary: "#5EEAD4", secondary: "#FDBA74", accent: "#FDE68A", background: "#F0FDFA", surface: "#FFFFFF", text: "#134E4A", textMuted: "#64748B", border: "#CCFBF1", success: "#4ADE80", warning: "#FCD34D", error: "#F43F5E" },
  },
  {
    id: "catppuccin-latte", mood: "pastel", name: "Catppuccin Latte",
    source: "Catppuccin Latte",
    colors: { primary: "#8839EF", secondary: "#EA76CB", accent: "#179299", background: "#EFF1F5", surface: "#FFFFFF", text: "#4C4F69", textMuted: "#6C6F85", border: "#CCD0DA", success: "#40A02B", warning: "#DF8E1D", error: "#D20F39" },
  },

  // Earth tones
  {
    id: "gruvbox-light", mood: "earth", name: "Gruvbox Light",
    source: "Gruvbox (light, hard)",
    colors: { primary: "#AF3A03", secondary: "#79740E", accent: "#B57614", background: "#FBF1C7", surface: "#F9F5D7", text: "#3C3836", textMuted: "#7C6F64", border: "#D5C4A1", success: "#79740E", warning: "#B57614", error: "#9D0006" },
  },
  {
    id: "terracotta-sage", mood: "earth", name: "Terracotta & Olive",
    source: "Tailwind CSS stone + orange-700, lime-700, yellow-700",
    colors: { primary: "#C2410C", secondary: "#4D7C0F", accent: "#A16207", background: "#FAFAF9", surface: "#F5F5F4", text: "#292524", textMuted: "#78716C", border: "#E7E5E4", success: "#4D7C0F", warning: "#B45309", error: "#B91C1C" },
  },

  // Black / gold or black / jewel-tone
  {
    id: "noir-gold", mood: "black-luxe", name: "Noir & Gold", dark: true, tags: ["gold"],
    source: "Standard metallic gold #D4AF37, champagne #F7E7CE",
    colors: { primary: "#D4AF37", secondary: "#B8860B", accent: "#F7E7CE", background: "#0B0B0B", surface: "#161616", text: "#F5F0E6", textMuted: "#A39E93", border: "#2A2A2A", success: "#4CAF50", warning: "#D4AF37", error: "#C0392B" },
  },
  {
    id: "onyx-emerald", mood: "black-luxe", name: "Onyx & Emerald", dark: true, tags: ["jewel"],
    source: "Standard gem colors: emerald #50C878, sapphire #0F52BA, ruby #E0115F",
    colors: { primary: "#50C878", secondary: "#0F52BA", accent: "#E0115F", background: "#0A0F0D", surface: "#121A17", text: "#EDEFEA", textMuted: "#9AA5A0", border: "#22302B", success: "#50C878", warning: "#E4A11B", error: "#E0115F" },
  },
  {
    id: "onyx-amethyst", mood: "black-luxe", name: "Onyx & Amethyst", dark: true, tags: ["jewel"],
    source: "Standard gem colors: amethyst #9966CC, sapphire #0F52BA, gold #D4AF37",
    colors: { primary: "#9966CC", secondary: "#0F52BA", accent: "#D4AF37", background: "#0D0B12", surface: "#17141F", text: "#F1EEF6", textMuted: "#A29CB0", border: "#2A2535", success: "#50C878", warning: "#D4AF37", error: "#E0115F" },
  },

  // Ink-and-paper
  {
    id: "ink", mood: "ink-paper", name: "Ink on Paper",
    source: "Off-white paper #FAF9F6 + near-black ink",
    colors: { primary: "#111111", secondary: "#3A3A3A", accent: "#E9E6DF", background: "#FAF9F6", surface: "#FFFFFF", text: "#111111", textMuted: "#6B6B6B", border: "#E2DFD8", success: "#2F6B3B", warning: "#9A6B00", error: "#9B1C1C" },
  },
  {
    id: "newsprint", mood: "ink-paper", name: "Newsprint",
    source: "Newsprint stock #F4F1EA + press black",
    colors: { primary: "#1A1A1A", secondary: "#4A4A4A", accent: "#C8C2B4", background: "#F4F1EA", surface: "#FBF9F4", text: "#1A1A1A", textMuted: "#5E5A55", border: "#D6D0C4", success: "#2F6B3B", warning: "#8A6A12", error: "#8B1E1E" },
  },

  // Duotone
  {
    id: "klein-cream", mood: "duotone", name: "Klein Blue & Cream",
    source: "International Klein Blue #002FA7",
    colors: { primary: "#002FA7", secondary: "#F3EEE3", accent: "#CFD8F3", background: "#F3EEE3", surface: "#FFFFFF", text: "#002FA7", textMuted: "#4F6BC4", border: "#002FA7", success: "#1B7F4C", warning: "#B7791F", error: "#C53030" },
  },
  {
    id: "gumroad", mood: "duotone", name: "Pink & Black",
    source: "Gumroad brand (#FF90E8, #FFC900, black)",
    colors: { primary: "#000000", secondary: "#FFC900", accent: "#FF90E8", background: "#F4F4F0", surface: "#FFFFFF", text: "#000000", textMuted: "#555555", border: "#000000", success: "#23A094", warning: "#FFC900", error: "#DC341E" },
  },

  // Gradient-heavy
  {
    id: "aurora", mood: "gradient", name: "Aurora Mesh",
    source: "Stripe brand gradient + navy #0A2540",
    gradient: "linear-gradient(135deg, #A960EE 0%, #FF333D 35%, #FFCB57 65%, #90E0FF 100%)",
    colors: { primary: "#635BFF", secondary: "#00D4FF", accent: "#FF80B5", background: "#F6F9FC", surface: "#FFFFFF", text: "#0A2540", textMuted: "#425466", border: "#E3E8EE", success: "#09825D", warning: "#C84801", error: "#DF1B41" },
  },
  {
    id: "iridescent", mood: "gradient", name: "Iridescent Haze",
    source: "WebGradients #013 Rainy Ashville + Tailwind violet/pink/cyan",
    gradient: "linear-gradient(135deg, #FBC2EB 0%, #A6C1EE 50%, #C2FFD8 100%)",
    colors: { primary: "#7C3AED", secondary: "#EC4899", accent: "#22D3EE", background: "#F8F7FF", surface: "#FFFFFF", text: "#1E1B4B", textMuted: "#6B6A8A", border: "#E0DDF5", success: "#10B981", warning: "#F59E0B", error: "#F43F5E" },
  },
  {
    id: "midnight-aurora", mood: "gradient", name: "Midnight Aurora", dark: true,
    source: "Popular CSS gradient #4158D0 → #C850C0 → #FFCC70",
    gradient: "linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%)",
    colors: { primary: "#C850C0", secondary: "#4158D0", accent: "#FFCC70", background: "#0E0B1F", surface: "#1A1533", text: "#F4F2FF", textMuted: "#A7A3C2", border: "#2C2550", success: "#34D399", warning: "#FFCC70", error: "#FB7185" },
  },

  // High-contrast black / white / red
  {
    id: "signal-bwr", mood: "bwr", name: "Signal",
    source: "Pure black / white + signal red #E10600",
    colors: { primary: "#E10600", secondary: "#000000", accent: "#E10600", background: "#FFFFFF", surface: "#FFFFFF", text: "#000000", textMuted: "#4D4D4D", border: "#000000", success: "#00813A", warning: "#E0A100", error: "#E10600" },
  },
  {
    id: "press-red", mood: "bwr", name: "Press Red",
    source: "Pantone 186 C #C8102E on newsprint",
    colors: { primary: "#C8102E", secondary: "#111111", accent: "#C8102E", background: "#F5F2EA", surface: "#FFFFFF", text: "#111111", textMuted: "#555555", border: "#111111", success: "#2F6B3B", warning: "#B7791F", error: "#C8102E" },
  },

  // Jewel tones on light
  {
    id: "emerald-salon", mood: "jewel-light", name: "Emerald Salon",
    source: "Tailwind CSS emerald-800, blue-900, rose-800 on ivory",
    colors: { primary: "#065F46", secondary: "#1E3A8A", accent: "#9F1239", background: "#FBF8F1", surface: "#FFFFFF", text: "#1C1C1C", textMuted: "#6B6456", border: "#E7DFCC", success: "#047857", warning: "#B45309", error: "#9F1239" },
  },
  {
    id: "sapphire-garnet", mood: "jewel-light", name: "Sapphire & Garnet",
    source: "Tailwind CSS blue-900, red-900 + dark goldenrod #B8860B",
    colors: { primary: "#1E3A8A", secondary: "#7F1D1D", accent: "#B8860B", background: "#F8F6F0", surface: "#FFFFFF", text: "#1A1A2E", textMuted: "#62627A", border: "#E3DDCB", success: "#047857", warning: "#B8860B", error: "#991B1B" },
  },

  // Sunset / warm gradient
  {
    id: "sweet-morning", mood: "sunset", name: "Sweet Morning",
    source: "uiGradients Sweet Morning (#FF5F6D → #FFC371)",
    gradient: "linear-gradient(135deg, #FF5F6D 0%, #FFC371 100%)",
    colors: { primary: "#FF5F6D", secondary: "#FFC371", accent: "#7B2CBF", background: "#FFF8F3", surface: "#FFFFFF", text: "#2B1B2E", textMuted: "#7A5C6A", border: "#F7DCCF", success: "#2A9D8F", warning: "#F4A261", error: "#E63946" },
  },
  {
    id: "outrun-dusk", mood: "sunset", name: "Outrun Dusk", dark: true,
    source: "Coolors f9c80e-f86624-ea3546-662e9b-43bccd",
    gradient: "linear-gradient(180deg, #F9C80E 0%, #F86624 35%, #EA3546 65%, #662E9B 100%)",
    colors: { primary: "#F86624", secondary: "#EA3546", accent: "#F9C80E", background: "#1B0B2E", surface: "#2A1245", text: "#FFEFE8", textMuted: "#C4A3B8", border: "#43305E", success: "#43BCCD", warning: "#F9C80E", error: "#EA3546" },
  },

  // Cool tech blue-purple
  {
    id: "linear-indigo", mood: "cool-tech", name: "Indigo Tech",
    source: "Linear brand indigo #5E6AD2 + Tailwind violet-500, cyan-500",
    colors: { primary: "#5E6AD2", secondary: "#8B5CF6", accent: "#06B6D4", background: "#FFFFFF", surface: "#F7F8FA", text: "#0F1222", textMuted: "#5E6273", border: "#E6E8EF", ...TW_STATUS },
  },
  {
    id: "deep-space", mood: "cool-tech", name: "Deep Space", dark: true,
    source: "Tailwind CSS slate-950 + indigo-500, violet-500, cyan-400",
    colors: { primary: "#6366F1", secondary: "#8B5CF6", accent: "#22D3EE", background: "#020617", surface: "#0F172A", text: "#E2E8F0", textMuted: "#94A3B8", border: "#1E293B", success: "#34D399", warning: "#FBBF24", error: "#F87171" },
  },

  // Grayscale with one neon pop
  {
    id: "graphite-lime", mood: "gray-neon", name: "Graphite & Lime", dark: true,
    source: "Tailwind CSS neutral + lime-400",
    colors: { primary: "#A3E635", secondary: "#404040", accent: "#A3E635", background: "#0A0A0A", surface: "#171717", text: "#FAFAFA", textMuted: "#A3A3A3", border: "#262626", success: "#A3E635", warning: "#FACC15", error: "#F87171" },
  },
  {
    id: "night-city", mood: "gray-neon", name: "Night City Yellow", dark: true,
    source: "Tailwind CSS zinc + cyberpunk yellow #FCEE0A",
    colors: { primary: "#FCEE0A", secondary: "#3F3F46", accent: "#00F0FF", background: "#0E0E10", surface: "#18181B", text: "#E4E4E7", textMuted: "#8E8E96", border: "#27272A", success: "#00F0FF", warning: "#FCEE0A", error: "#FF003C" },
  },

  // Vintage sepia / muted warm
  {
    id: "solarized-light", mood: "sepia", name: "Solarized Light",
    source: "Solarized (light)",
    colors: { primary: "#CB4B16", secondary: "#B58900", accent: "#268BD2", background: "#FDF6E3", surface: "#EEE8D5", text: "#073642", textMuted: "#586E75", border: "#D9D2BD", success: "#859900", warning: "#B58900", error: "#DC322F" },
  },
  {
    id: "vintage-sepia", mood: "sepia", name: "Vintage Sepia",
    source: "Named colors: café au lait #A67B5B, camel #C19A6B, sepia #704214",
    colors: { primary: "#704214", secondary: "#A67B5B", accent: "#C19A6B", background: "#F2E8D5", surface: "#FAF4E6", text: "#3E2F23", textMuted: "#7A6652", border: "#DCCBAF", success: "#6B7F3A", warning: "#C08A2E", error: "#9E3B2C" },
  },
]

export const paletteById = Object.fromEntries(PALETTES.map((x) => [x.id, x]))
export const moodName = Object.fromEntries(MOODS.map((m) => [m.id, m.name]))
