// Stage 5: Layout and composition. Each section type has 6–8 layout variants.
// `wire` is a tiny layout tree rendered as a live wireframe thumbnail by
// components/previews/Wireframe.jsx. Leaves are strings (see LEAVES there);
// nodes are built with the helpers below.
//
// Variant `tags` drive direction filtering:
//   soft  – rounded, floating, gentle compositions (excluded by brutalist-type directions)
//   dense – dense multi-column or stat-grid layouts (excluded by Editorial and
//           other airy directions; favored by Newspaper / Zine)
//   busy  – collage-like, many overlapping elements (excluded by Minimal)
//   media – image/video-led

const row = (...c) => ({ t: "row", c })
const rowW = (w, ...c) => ({ t: "row", w, c })
const col = (...c) => ({ t: "col", c })
const center = (...c) => ({ t: "col", c, center: true })
const grid = (cols, n, item, opts = {}) => ({ t: "grid", cols, n, item, ...opts })
const box = (...c) => ({ t: "box", c })
const bg = (tone, ...c) => ({ t: "bg", tone, c })
const table = (cols, rows, opts = {}) => ({ t: "table", cols, rows, ...opts })

const v = (id, name, wire, tags = []) => ({ id, name, wire, tags })

const tierCard = box("ps", "price", "p", "check", "check", "btn")

export const SECTION_TYPES = [
  {
    id: "hero",
    name: "Hero",
    required: true,
    variants: [
      v("centered-fullbleed", "Centered text over full-bleed background", bg("img", center("H", "p", "btn2")), ["media"]),
      v("split-text-left", "Split: text left, image right", row(col("H", "p", "btn2"), "img")),
      v("split-image-left", "Split: image left, text right", row("img", col("H", "p", "btn2"))),
      v("text-only", "Minimal text-only, no image", center("H", "p", "ps", "btn")),
      v("oversized-headline", "Oversized headline, small supporting visual", col("X", "X", rowW([3, 1], col("p", "ps"), "imgS"))),
      v("product-video", "Headline with embedded product video", center("H", "ps", "btn", "vid"), ["media"]),
      v("floating-mockups", "Headline with floating UI mockups", row(col("H", "p", "btn2"), "mock"), ["busy", "soft"]),
      v("signup-form", "Two-column with signup form beside the headline", row(col("H", "p", "ps"), box("input", "input", "btn"))),
    ],
  },
  {
    id: "logos",
    name: "Logo bar / social proof",
    variants: [
      v("single-row", "Single row with caption", center("ps", grid(6, 6, "logo"))),
      v("label-left", "Label left, logos right", rowW([1, 4], "ps", grid(5, 5, "logo"))),
      v("marquee", "Scrolling marquee", center("ps", "marquee"), ["busy"]),
      v("boxed-grid", "Boxed logo grid", grid(4, 8, box("logo")), ["dense"]),
      v("stat-logos", "Headline stat + logos", rowW([1, 2], col("num", "ps"), grid(4, 4, "logo"))),
      v("two-rows", "Two dense rows", center("ps", grid(5, 10, "logo")), ["dense"]),
      v("quote-logos", "Pull quote with logos", rowW([2, 3], box("quote", "p", "ps"), grid(3, 6, "logo"))),
    ],
  },
  {
    id: "integrations",
    name: "Integration / partner cloud",
    variants: [
      v("icon-grid", "Centered icon grid", center("h", "ps", grid(6, 12, box("icon"))), ["dense"]),
      v("hub", "Hub and spoke", center("h", "hub"), ["busy", "soft"]),
      v("split-list", "Text left, icon grid right", row(col("h", "p", "btn"), grid(3, 9, box("icon")))),
      v("described-cards", "Cards with descriptions", grid(3, 6, box(row("icon", "ps"), "p"))),
      v("category-tabs", "Category tabs + grid", col("h", "tabs", grid(4, 8, box("icon")))),
      v("single-row-cta", "Single row with CTA", center("h", grid(8, 8, "icon"), "btn")),
      v("directory", "Searchable directory", col("h", "input", grid(4, 8, box(row("icon", "ps")))), ["dense"]),
    ],
  },
  {
    id: "features",
    name: "Feature grid",
    variants: [
      v("three-col-icons", "Three columns with icons", center("h", "ps", grid(3, 3, col("icon", "h", "p")))),
      v("four-col-cards", "Four cards", grid(4, 4, box("icon", "h", "p"))),
      v("two-by-two", "2 × 2 large cards", grid(2, 4, box("icon", "h", "p", "p"))),
      v("bento", "Bento grid", "bento", ["busy"]),
      v("list-image", "Checklist + image", row(col("h", row("icon", "ps"), row("icon", "ps"), row("icon", "ps")), "img")),
      v("dense-list", "Dense 3 × 3 list", grid(3, 9, row("icon", "ps")), ["dense"]),
      v("numbered", "Numbered columns", grid(3, 3, col("num", "h", "p"))),
      v("centered-large", "Big headline, small features", center("H", "p", grid(3, 3, center("icon", "ps")))),
    ],
  },
  {
    id: "showcase",
    name: "Feature showcase",
    variants: [
      v("soft-alternating", "Soft alternating image / text", col(row(col("h", "p", "btn"), "imgR"), row("imgR", col("h", "p", "btn"))), ["soft"]),
      v("edge-alternating", "Edge-to-edge alternating", col(row(col("h", "p"), "img"), "hr", row("img", col("h", "p")))),
      v("sticky-scroll", "Sticky image, scrolling text", row(col("h", "p", "hr", "h", "p"), "imgT")),
      v("tabbed", "Tabbed showcase", col("tabs", row(col("h", "p", "btn"), "img"))),
      v("big-image", "Large image with captions", col("img", grid(3, 3, col("h", "p")))),
      v("zigzag-cards", "Zig-zag cards", col(box(row(col("h", "p"), "imgR")), box(row("imgR", col("h", "p")))), ["soft"]),
      v("magazine", "Two-column magazine", grid(2, 2, col("img", "h", "p"))),
      v("dense-stack", "Dense multi-column stack", grid(3, 6, col("imgS", "ps")), ["dense"]),
    ],
  },
  {
    id: "comparison",
    name: "Comparison table",
    contentBearing: true,
    variants: [
      v("plan-matrix", "Plan feature matrix", table(4, 5)),
      v("us-vs-them", "Us vs. them columns", grid(2, 2, box("h", "check", "check", "check"))),
      v("highlight-column", "Highlighted recommended column", table(4, 5, { hl: 2 })),
      v("checklist-rows", "Checklist rows", table(3, 6)),
      v("stacked-cards", "Stacked plan cards", grid(3, 3, box("ps", "check", "check", "check", "btn"))),
      v("dense-sticky", "Dense table, sticky header", table(5, 8), ["dense"]),
      v("toggle-table", "Toggle + table", center("seg", table(4, 4))),
    ],
  },
  {
    id: "testimonials",
    name: "Testimonials",
    contentBearing: true,
    variants: [
      v("single-quote", "Single large quote", center("quote", "H", "av", "ps")),
      v("three-cards", "Three cards", grid(3, 3, box("star", "p", "p", row("av", "ps")))),
      v("masonry", "Masonry wall", "masonry", ["busy", "dense"]),
      v("carousel", "Carousel", rowW([1, 8, 1], "arrow", box("quote", "p", row("av", "ps")), "arrow")),
      v("photo-split", "Photo + quote split", row("imgT", col("quote", "H", "av", "ps"))),
      v("logo-attributed", "Company-attributed quotes", grid(2, 2, box("logo", "p", "ps"))),
      v("video", "Video testimonials", grid(3, 3, "vid"), ["media"]),
      v("tweet-grid", "Social post grid", grid(3, 6, box(row("av", "ps"), "p")), ["dense"]),
    ],
  },
  {
    id: "stats",
    name: "Stats / numbers",
    variants: [
      v("four-up", "Four across", grid(4, 4, center("num", "ps"))),
      v("big-single", "One big number", center("X", "p")),
      v("split", "Text left, stats right", row(col("h", "p"), grid(2, 4, col("num", "ps")))),
      v("cards", "Stat cards", grid(3, 3, box("num", "ps", "p"))),
      v("dense-grid", "Dense stat grid", grid(4, 8, box("num", "ps")), ["dense"]),
      v("dividers", "Inline with dividers", row(center("num", "ps"), "vr", center("num", "ps"), "vr", center("num", "ps"))),
      v("over-image", "Stats over image", bg("img", grid(3, 3, center("num", "ps"))), ["media"]),
    ],
  },
  {
    id: "timeline",
    name: "Timeline",
    variants: [
      v("center-alternating", "Center line, alternating", { t: "vtl", alt: true }, ["soft"]),
      v("left-rail", "Left rail", { t: "vtl" }),
      v("horizontal", "Horizontal steps", { t: "htl" }),
      v("numbered-cards", "Numbered step cards", grid(4, 4, box("num", "h", "p"))),
      v("roadmap", "Roadmap columns (Now / Next / Later)", grid(3, 3, col("ps", box("p"), box("p")))),
      v("changelog", "Dense changelog", col(rowW([1, 4], "ps", "p"), rowW([1, 4], "ps", "p"), rowW([1, 4], "ps", "p"), rowW([1, 4], "ps", "p")), ["dense"]),
    ],
  },
  {
    id: "team",
    name: "Team / about",
    variants: [
      v("avatar-grid", "Avatar grid", grid(4, 8, center("avL", "ps"))),
      v("photo-cards", "Photo cards", grid(3, 3, box("img", "h", "ps"))),
      v("founder", "Founder spotlight", row("imgT", col("h", "p", "p", "ps"))),
      v("about-split", "About story + photo grid", row(col("H", "p", "p"), grid(2, 4, "imgS"))),
      v("dense-list", "Dense name list", grid(4, 12, row("av", "ps")), ["dense"]),
      v("story-row", "Mission + avatar row", center("h", "p", "avrow")),
    ],
  },
  {
    id: "video",
    name: "Video / demo",
    variants: [
      v("centered", "Centered player", center("h", "ps", "vid")),
      v("split", "Text left, video right", row(col("h", "p", "btn"), "vid")),
      v("full-bleed", "Full-bleed video", bg("dark", center("play")), ["media"]),
      v("chapters", "Video with chapter list", rowW([2, 1], "vid", col("ps", "ps", "ps", "ps"))),
      v("modal", "Headline + play button (modal)", center("H", "p", "play")),
      v("browser-frame", "Browser-frame demo", center("h", "browser"), ["soft"]),
    ],
  },
  {
    id: "pricing",
    name: "Pricing",
    contentBearing: true,
    variants: [
      v("three-tier", "Three tiers", grid(3, 3, tierCard)),
      v("highlight-middle", "Three tiers, highlighted middle", grid(3, 3, tierCard, { hl: 1 })),
      v("two-tier", "Two tiers", grid(2, 2, tierCard)),
      v("toggle", "Monthly / yearly toggle", center("seg", grid(3, 3, tierCard))),
      v("single-plan", "Single plan", box(row(col("h", "price", "btn"), col("check", "check", "check", "check")))),
      v("table", "Pricing table", table(4, 5, { hl: 2 }), ["dense"]),
      v("usage-slider", "Usage slider", center("h", "slider", "price", "btn")),
    ],
  },
  {
    id: "faq",
    name: "FAQ",
    variants: [
      v("accordion", "Single-column accordion", col("h", "faq", "faq", "faq", "faq")),
      v("two-col", "Two-column accordion", col("h", grid(2, 6, "faq"))),
      v("split-intro", "Intro left, questions right", row(col("h", "p", "btn"), col("faq", "faq", "faq", "faq"))),
      v("open-grid", "All answers open, grid", grid(2, 4, col("h", "p", "p")), ["dense"]),
      v("categorized", "Categorized sidebar", rowW([1, 3], col("ps", "ps", "ps", "ps"), col("faq", "faq", "faq", "faq"))),
      v("search", "Centered with search", center("h", "input", "faq", "faq", "faq")),
    ],
  },
  {
    id: "newsletter",
    name: "Newsletter signup",
    variants: [
      v("centered", "Centered inline form", center("h", "p", "inputBtn")),
      v("split", "Text left, form right", row(col("h", "p"), "inputBtn")),
      v("card", "Boxed card", box(center("icon", "h", "inputBtn")), ["soft"]),
      v("image-side", "Image beside form", row("img", col("h", "p", "inputBtn"))),
      v("banner", "Banner strip", bg("accent", row("h", "inputBtn"))),
      v("minimal", "Minimal underline field", center("ps", "inputLine")),
    ],
  },
  {
    id: "blog",
    name: "Blog / resources preview",
    variants: [
      v("three-cards", "Three post cards", grid(3, 3, box("img", "ps", "h", "p"))),
      v("featured-list", "Featured post + list", row(col("img", "h", "p"), col(row("imgS", col("h", "ps")), row("imgS", col("h", "ps")), row("imgS", col("h", "ps"))))),
      v("text-list", "Text list with dates", col("hr", rowW([1, 4], "ps", "h"), "hr", rowW([1, 4], "ps", "h"), "hr", rowW([1, 4], "ps", "h"))),
      v("magazine", "Magazine grid", "bento", ["dense", "busy"]),
      v("horizontal-scroll", "Horizontal scroll row", "hscroll", ["soft"]),
      v("dense-columns", "Dense headline columns", grid(4, 8, col("ps", "p")), ["dense"]),
    ],
  },
  {
    id: "cta",
    name: "Call to action band",
    variants: [
      v("centered-solid", "Centered on solid color", bg("accent", center("H", "btn2"))),
      v("split-dark", "Dark band, button right", bg("dark", row(col("H", "p"), "btn"))),
      v("with-image", "With image", bg("muted", row(col("H", "p", "btn"), "img"))),
      v("boxed", "Boxed card", box(center("H", "p", "btn")), ["soft"]),
      v("email", "Email capture", bg("accent", center("H", "inputBtn"))),
      v("oversized", "Oversized text", col("X", "btn")),
      v("gradient", "Gradient banner", bg("gradient", center("H", "btn")), ["soft"]),
    ],
  },
  {
    id: "footer",
    name: "Footer",
    required: true,
    variants: [
      v("four-col", "Brand + link columns", rowW([2, 1, 1, 1], col("logo", "p"), col("ps", "p", "p"), col("ps", "p", "p"), col("ps", "p", "p"))),
      v("centered", "Simple centered", center("logo", "links", "ps")),
      v("minimal-row", "Minimal single row", row("logo", "links")),
      v("big-wordmark", "Oversized wordmark", col(grid(4, 4, col("ps", "p", "p")), "X")),
      v("newsletter", "With newsletter", row(col("h", "inputBtn"), grid(3, 3, col("ps", "p", "p")))),
      v("sitemap", "Dense sitemap", grid(6, 6, col("ps", "p", "p", "p", "p")), ["dense"]),
      v("dark-cta", "Dark with CTA", bg("dark", col(row("H", "btn"), "hr", row("logo", "links")))),
    ],
  },
]

export const sectionById = Object.fromEntries(SECTION_TYPES.map((s) => [s.id, s]))
export const DEFAULT_SECTIONS = ["hero", "footer"]
