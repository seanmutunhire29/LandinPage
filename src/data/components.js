// Stage 4: UI components. One variant id per category ends up in the spec.
// Rendering for each variant lives in components/previews/ComponentPreviews.jsx.

export const COMPONENT_CATEGORIES = [
  {
    id: "buttons",
    name: "Buttons",
    blurb: "The primary call-to-action style used across the page.",
    variants: [
      { id: "solid", name: "Solid fill" },
      { id: "outline", name: "Outline" },
      { id: "ghost", name: "Ghost / text-only" },
      { id: "pill", name: "Pill-shaped" },
      { id: "icon-leading", name: "Icon leading" },
      { id: "icon-trailing", name: "Icon trailing" },
      { id: "gradient", name: "Gradient fill" },
      { id: "underline-hover", name: "Underline-on-hover text" },
    ],
  },
  {
    id: "cards",
    name: "Cards",
    blurb: "The container used for features, pricing tiers and posts.",
    variants: [
      { id: "bordered", name: "Bordered" },
      { id: "shadowed", name: "Shadowed" },
      { id: "filled", name: "Filled" },
      { id: "image-top", name: "Image top" },
      { id: "icon-top", name: "Icon top" },
      { id: "horizontal", name: "Horizontal split" },
      { id: "layered", name: "Overlapping / layered" },
      { id: "text-only", name: "Minimal text-only" },
    ],
  },
  {
    id: "nav",
    name: "Navigation bar",
    blurb: "How the top of the page is organized and how it reacts to scroll.",
    wide: true,
    variants: [
      { id: "centered-logo", name: "Centered logo, side links" },
      { id: "logo-left-right", name: "Logo left, links right" },
      { id: "logo-left-center", name: "Logo left, links centered" },
      { id: "sticky-bg", name: "Sticky, background on scroll" },
      { id: "transparent-solid", name: "Transparent to solid on scroll" },
      { id: "search-center", name: "Split with centered search" },
      { id: "minimal-cta", name: "Minimal logo + single CTA" },
    ],
  },
  {
    id: "inputs",
    name: "Inputs & forms",
    blurb: "Field styling for signups, contact and newsletter forms.",
    variants: [
      { id: "underline", name: "Underline" },
      { id: "bordered", name: "Bordered box" },
      { id: "filled", name: "Filled box" },
      { id: "floating-label", name: "Floating label" },
      { id: "inline-validation", name: "Inline validation" },
      { id: "stacked-group", name: "Stacked, grouped labels" },
    ],
  },
  {
    id: "badges",
    name: "Badges & tags",
    blurb: "Small labels for plans, categories and status.",
    variants: [
      { id: "pill", name: "Pill" },
      { id: "square", name: "Square" },
      { id: "outline", name: "Outline" },
      { id: "dot", name: "Dot indicator" },
      { id: "icon-label", name: "Icon + label" },
    ],
  },
  {
    id: "toggles",
    name: "Toggles & switches",
    blurb: "Binary and small-choice controls, e.g. monthly vs yearly pricing.",
    variants: [
      { id: "switch", name: "Sliding switch" },
      { id: "checkbox", name: "Checkbox-style" },
      { id: "segmented", name: "Segmented control" },
    ],
  },
  {
    id: "avatars",
    name: "Avatars",
    blurb: "People in testimonials, team sections and social proof.",
    variants: [
      { id: "circle", name: "Circular" },
      { id: "rounded-square", name: "Square-rounded" },
      { id: "status-dot", name: "With status dot" },
      { id: "stacked", name: "Stacked group" },
    ],
  },
  {
    id: "tooltips",
    name: "Tooltips & popovers",
    blurb: "Contextual hints. Hover or click to try each one.",
    variants: [
      { id: "dark-tooltip", name: "Simple dark tooltip" },
      { id: "light-popover", name: "Bordered light popover" },
      { id: "arrow-callout", name: "Arrow-pointer callout" },
    ],
  },
  {
    id: "accordions",
    name: "Accordions",
    blurb: "Expandable rows, mostly used in the FAQ.",
    variants: [
      { id: "plus-minus", name: "Plus / minus indicator" },
      { id: "chevron", name: "Chevron rotate" },
      { id: "bordered-panel", name: "Bordered panel" },
      { id: "divider", name: "Borderless with dividers" },
    ],
  },
  {
    id: "tabs",
    name: "Tabs",
    blurb: "Switching between views in showcases and pricing.",
    variants: [
      { id: "underline", name: "Underline indicator" },
      { id: "pill", name: "Pill / segmented" },
      { id: "boxed", name: "Boxed with fill" },
    ],
  },
  {
    id: "progress",
    name: "Progress & loaders",
    blurb: "Progress, steps and loading states.",
    variants: [
      { id: "linear", name: "Thin linear bar" },
      { id: "stepped", name: "Stepped indicator" },
      { id: "spinner", name: "Circular spinner" },
      { id: "skeleton", name: "Skeleton blocks" },
    ],
  },
]

export const componentCategoryById = Object.fromEntries(COMPONENT_CATEGORIES.map((c) => [c.id, c]))

// Default kits: directions start from one and override individual categories.
export const KITS = {
  sharp: { buttons: "solid", cards: "bordered", nav: "logo-left-right", inputs: "bordered", badges: "square", toggles: "checkbox", avatars: "rounded-square", tooltips: "dark-tooltip", accordions: "plus-minus", tabs: "underline", progress: "linear" },
  clean: { buttons: "solid", cards: "shadowed", nav: "logo-left-right", inputs: "bordered", badges: "pill", toggles: "switch", avatars: "circle", tooltips: "dark-tooltip", accordions: "chevron", tabs: "underline", progress: "linear" },
  soft: { buttons: "pill", cards: "shadowed", nav: "logo-left-center", inputs: "filled", badges: "pill", toggles: "switch", avatars: "circle", tooltips: "light-popover", accordions: "chevron", tabs: "pill", progress: "linear" },
  editorial: { buttons: "underline-hover", cards: "text-only", nav: "centered-logo", inputs: "underline", badges: "outline", toggles: "checkbox", avatars: "circle", tooltips: "light-popover", accordions: "divider", tabs: "underline", progress: "linear" },
  loud: { buttons: "gradient", cards: "layered", nav: "transparent-solid", inputs: "filled", badges: "pill", toggles: "segmented", avatars: "stacked", tooltips: "arrow-callout", accordions: "bordered-panel", tabs: "boxed", progress: "stepped" },
}
