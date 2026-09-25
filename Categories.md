# Landing Page Design Tool: Decision Stages

Scope: MVP covers landing pages only. Users move through a sequence of stages. Each stage after Stage 0 shows a limited set of options, filtered by the choices made in prior stages. No live composed preview during the flow. The full page renders only after the final stage, from the build agent.

---

## Stage 0: Direction

This is the first decision and the one everything else filters against. The user picks one named system from a curated set. Each system bundles a typography feel, a color mood, a surface treatment, a radius/shadow philosophy, and a motion character, so the choice is legible from a couple of representative thumbnails rather than requiring full preview.

Twenty starting directions:

1. **Minimal / Swiss** — grid-driven, restrained type, mostly black/white/one accent, flat surfaces, sharp or slightly rounded corners, little to no motion.
2. **Brutalist** — raw, unpolished on purpose, monospace or oversized sans headlines, high-contrast color, flat surfaces, hard edges, abrupt or no transitions.
3. **Editorial / Serif-led** — serif headlines, generous whitespace, muted or ink-and-paper color, flat surfaces, soft corners, slow fades.
4. **Corporate / SaaS Clean** — geometric sans, blue or teal-led palettes, flat or lightly shadowed surfaces, medium radius, short functional transitions.
5. **Maximalist / Bold** — display type, saturated multi-color palettes, flat or textured surfaces, mixed radius, energetic motion.
6. **Retro-Futurist / Y2K** — chunky or pixel-influenced type, neon or chrome-toned palettes, glossy or gradient surfaces, rounded-to-pill corners, bouncy motion.
7. **Glassmorphic / Soft-tech** — clean sans, cool palettes over a busy or gradient background, translucent blurred surfaces, medium-high radius, soft floating motion.
8. **Claymorphic / Playful-3D** — rounded friendly sans, pastel palettes, soft inflated surfaces with inner highlight, high radius, springy motion.
9. **Dark Luxury / Premium** — thin serif or refined sans, black/gold or black/jewel-tone palettes, flat or subtly shadowed dark surfaces, low-medium radius, slow deliberate motion.
10. **Organic / Earthy** — humanist sans or slab serif, natural muted palettes, flat or lightly textured surfaces, soft irregular radius, gentle motion.
11. **Neo-Brutalist Pastel** — brutalist structure (hard borders, raw grid) but pastel color instead of high contrast, flat surfaces, thick black outlines, snappy motion.
12. **Cyberpunk / High-Tech** — condensed or monospace type, neon on near-black, glowing borders, sharp or beveled edges, glitch-style or fast motion.
13. **Scandinavian / Hygge** — humanist sans, warm neutral palette with one muted accent, flat or soft-shadow surfaces, medium rounded corners, calm slow motion.
14. **Vaporwave** — script or chrome display headlines, pink/purple/cyan gradient palette, glossy gradient surfaces, high radius, slow drifting motion.
15. **Art Deco** — high-contrast serif display, gold/black/jewel-tone palette, flat surfaces with geometric border patterns, sharp symmetrical corners, minimal formal motion.
16. **Bauhaus / Constructivist** — geometric sans, primary color palette (red/yellow/blue/black), flat surfaces, hard geometric edges, mechanical grid-snapped motion.
17. **Grunge / Textured** — condensed or stencil display type, muted or desaturated palette with texture overlays, flat textured surfaces, irregular hard edges, abrupt motion.
18. **Newspaper / Zine** — serif body text at small sizes, dense multi-column layout feel, black/white/one spot color, flat surfaces, hard edges, no motion.
19. **Holographic / Iridescent** — rounded sans, shifting gradient/iridescent palette, glossy translucent surfaces, high radius, shimmering slow motion.
20. **Neumorphic Soft** — humanist sans, low-contrast monochrome palette (background and surface nearly the same color), dual soft shadow surfaces, medium-high radius, subtle motion.

Each direction stores default values for every stage below. Later stages show only the options tagged as compatible with the chosen direction. A user can typically override individual stage choices afterward, but the default set narrows the field to what's coherent.

---

## Stage 1: Typography

Universe of options before filtering, grouped by category:

- Geometric sans (e.g., Poppins-style, Futura-style)
- Humanist sans (e.g., Inter-style, Söhne-style)
- Grotesk sans (e.g., Helvetica-style, Neue Haas-style)
- Condensed sans (narrow, high-impact headline type)
- Rounded sans (soft terminals, friendly feel)
- Variable/expressive sans (wide weight range, used for dramatic size jumps)
- Monospace (e.g., JetBrains Mono-style, IBM Plex Mono-style)
- Serif, transitional (e.g., Georgia-style)
- Serif, old-style (warmer, lower contrast, book-like)
- Serif, high-contrast/display (e.g., Playfair-style)
- Slab serif (e.g., Roboto Slab-style)
- Slab serif, display weight (heavier, for oversized headlines)
- Script/handwritten accent (used sparingly, paired with a plain sans body)
- Display/decorative, condensed or oversized
- Pixel/bitmap
- Stencil

Each option is really a pairing: one typeface for headings, one for body, plus a defined size scale (e.g., 6 to 8 steps from small label text to hero headline) and a weight range.

Filtering by direction, example:

- Minimal / Swiss shows: humanist sans, grotesk sans, geometric sans.
- Brutalist shows: monospace, grotesk sans, condensed sans, stencil.
- Editorial shows: serif transitional, serif old-style, serif display, slab serif, paired with a plain humanist sans for body.
- Corporate shows: geometric sans, humanist sans, rounded sans.
- Maximalist shows: display/decorative, variable/expressive sans, slab display.
- Retro-Futurist shows: display/decorative, monospace, pixel/bitmap.
- Glassmorphic shows: humanist sans, geometric sans, rounded sans.
- Claymorphic shows: rounded sans, humanist sans.
- Dark Luxury shows: serif display, serif transitional, thin-weight grotesk.
- Organic shows: humanist sans, slab serif, old-style serif.
- Neo-Brutalist Pastel shows: monospace, grotesk sans, rounded sans.
- Cyberpunk shows: condensed sans, monospace, pixel/bitmap.
- Scandinavian shows: humanist sans, rounded sans.
- Vaporwave shows: script accent, display/decorative, condensed sans.
- Art Deco shows: serif display (high contrast), geometric sans for body.
- Bauhaus shows: geometric sans, grotesk sans.
- Grunge shows: condensed sans, stencil, slab display.
- Newspaper / Zine shows: serif old-style, serif transitional, slab serif.
- Holographic shows: rounded sans, variable/expressive sans.
- Neumorphic Soft shows: humanist sans, rounded sans.

User picks one pairing. Output: heading font, body font, type scale values.

---

## Stage 2: Color Palette

Universe of options, grouped by mood:

- Monochrome + single accent
- Muted/desaturated multi-color
- Saturated/vibrant multi-color
- Neon on dark
- Pastel
- Earth tones
- Black/gold or black/jewel-tone
- Ink-and-paper (near-black on near-white, minimal color)
- Duotone (two dominant colors, high contrast between them)
- Gradient-heavy (a palette defined by a signature gradient, used across backgrounds and accents)
- High-contrast black/white/red
- Jewel tones on light background (as opposed to jewel tones on black)
- Sunset/warm gradient (orange, pink, warm purple)
- Cool tech blue-purple
- Grayscale with one neon pop color
- Vintage sepia/muted warm

Each option is a full palette with semantic roles, not raw swatches: primary, secondary, accent, background, surface, text, text-muted, border, success/warning/error.

Filtering by direction, example:

- Minimal / Swiss shows: monochrome + accent, ink-and-paper.
- Brutalist shows: saturated/vibrant, high-contrast black/white/red.
- Editorial shows: ink-and-paper, muted multi-color, earth tones, vintage sepia.
- Corporate shows: monochrome + accent, muted multi-color, cool tech blue-purple.
- Maximalist shows: saturated/vibrant, neon on dark, gradient-heavy.
- Retro-Futurist shows: neon on dark, saturated/vibrant, sunset/warm gradient.
- Glassmorphic shows: muted multi-color, gradient-heavy, cool tech blue-purple.
- Claymorphic shows: pastel.
- Dark Luxury shows: black/gold, black/jewel-tone.
- Organic shows: earth tones, muted multi-color, vintage sepia.
- Neo-Brutalist Pastel shows: pastel, duotone.
- Cyberpunk shows: neon on dark, grayscale with neon pop.
- Scandinavian shows: earth tones, muted multi-color.
- Vaporwave shows: gradient-heavy, sunset/warm gradient, neon on dark.
- Art Deco shows: black/gold, jewel tones on light.
- Bauhaus shows: high-contrast black/white/red, saturated/vibrant (primary triad).
- Grunge shows: muted/desaturated, vintage sepia.
- Newspaper / Zine shows: ink-and-paper, high-contrast black/white/red.
- Holographic shows: gradient-heavy, cool tech blue-purple.
- Neumorphic Soft shows: monochrome + accent, muted multi-color.

User picks one palette. Output: color role map with hex or HSL values.

---

## Stage 3: Surface, Radius, and Shadow

This stage sets the material feel: how cards, buttons, and containers render as physical-seeming surfaces.

Universe of options:

- Flat (no shadow, solid fill, hard or slightly rounded corners)
- Soft shadow (low elevation, subtle blur, small-medium radius)
- Glass (translucent fill, background blur, thin light border, medium-high radius)
- Clay (inflated look, soft large shadow, inner highlight, high radius)
- Neumorphic (matching background and surface color, dual soft shadows for a pressed/raised look)
- Hard edge (no radius, solid border, no shadow)
- Outlined only (transparent fill, visible border, no shadow)
- Layered/stacked shadow (multiple offset shadows for a deliberate depth effect)
- Gradient border (transparent or flat fill, a gradient used as the border color)
- Frosted heavy blur (stronger blur than standard glass, used with busy backgrounds)
- Textured/grain (flat fill with a subtle noise or paper texture overlay)
- Skeuomorphic realistic (soft gradients and shadows mimicking a physical, lit surface)

This stage is mostly pre-set by the Stage 0 direction choice rather than shown as an open menu, since a mismatched surface (e.g., brutalist plus glass) breaks coherence. Directions with more visual flexibility (Minimal, Corporate, Scandinavian) offer a visible choice between two or three compatible surface options rather than a single locked default.

Output: surface type, radius scale (e.g., none, small, medium, large, pill), shadow style, border style, blur amount if applicable, texture flag if applicable.

---

## Stage 4: UI Components

At this stage the user picks specific rendered variants for the recurring building blocks of a landing page. Each option is shown as a small rendered component (button, card, input, nav bar) using the type, color, and surface choices already made, not as an abstract label.

Component categories and variant families:

- **Buttons**: solid fill, outline, ghost/text-only, pill-shaped, icon-leading, icon-trailing, gradient fill, underline-on-hover text button
- **Cards**: bordered, shadowed, filled, image-top, icon-top, horizontal split, overlapping/layered, minimal text-only
- **Navigation bar**: centered logo with side links, logo-left with right-aligned links, logo-left with centered links, sticky with background change on scroll, transparent-to-solid on scroll, split with search bar centered, minimal logo-only with a single CTA button
- **Inputs/forms**: underline style, bordered box, filled box, floating label, inline validation style, stacked multi-field with grouped labels
- **Badges/tags**: pill, square, outline, dot-indicator, icon-plus-label
- **Toggles/switches**: standard sliding switch, checkbox-style, segmented control
- **Avatars**: circular, square-rounded, with status dot, stacked group (overlapping avatar cluster)
- **Tooltips/popovers**: simple dark tooltip, bordered light popover, arrow-pointer callout
- **Accordions**: plus/minus icon indicator, chevron rotate indicator, bordered panel, borderless with divider lines
- **Tabs**: underline-indicator tabs, pill/segmented tabs, boxed tabs with background fill
- **Progress bars/loaders**: thin linear bar, stepped progress indicator, circular spinner, skeleton loading blocks

Filtering by direction narrows which variant families are shown (brutalist rarely shows pill buttons or floating labels; claymorphic rarely shows sharp bordered cards) but the user still makes an explicit choice per component category, since this is where per-site personality shows up most directly.

Output: a variant id per component category.

---

## Stage 5: Layout and Composition

This stage is structural, not a token. The user builds the page as an ordered list of sections, choosing a layout variant for each.

Section types available:

- Hero
- Logo bar / social proof strip
- Integration/partner logo cloud (distinct from social proof, framed as "works with")
- Feature grid
- Feature showcase (alternating image/text)
- Comparison table (plan or competitor comparison)
- Testimonials
- Stats/numbers
- Timeline (product history, process steps, or roadmap)
- Team / about
- Video/demo
- Pricing
- FAQ
- Newsletter signup
- Blog/resources preview
- Call to action band
- Footer

Each section type has 6 to 8 layout variants shown as thumbnails. Hero, for example: centered text over full-bleed background, split with text left and image right, split with image left and text right, minimal text-only with no image, oversized headline with small supporting visual, headline with embedded product video, headline with floating UI mockup elements, two-column with a signup form beside the headline.

The user first picks which sections to include (a checklist, with hero and footer mandatory), then picks a layout variant for each included section, then can reorder sections by dragging.

Filtering by direction affects which variants are shown as options: Brutalist rarely offers the soft alternating showcase variant; Editorial rarely offers dense stat-grid variants; Newspaper/Zine favors dense multi-column variants across most section types. Content-bearing sections (pricing, testimonials, comparison table) are marked separately since they also need copy or data input, covered below.

Output: ordered array of {section type, variant id}.

---

## Stage 6: Motion

Universe of options:

- None (no transitions, instant state changes)
- Subtle (short fades and slides on scroll, quick hover states)
- Standard (moderate duration entrance animations, hover lift on cards/buttons)
- Expressive (longer entrance sequences, parallax elements, bouncy easing)
- Springy (overshoot/bounce easing on interactive elements, used mainly with clay and retro directions)
- Staggered reveal (list and grid items animate in sequence rather than all at once)
- Heavy parallax (background and foreground layers move at different scroll speeds)
- Magnetic cursor interaction (buttons and icons subtly shift toward the cursor on hover)
- Typewriter text (headline or label text types itself in on load or scroll)
- Morph/shape-shift transitions (shapes or backgrounds smoothly change form between states)

Filtering by direction: Minimal and Corporate default to none or subtle. Brutalist defaults to none. Maximalist and Retro-Futurist default to expressive or heavy parallax. Claymorphic defaults to springy. Dark Luxury defaults to subtle with slow durations. Cyberpunk defaults to staggered reveal or morph transitions. Vaporwave and Holographic default to heavy parallax or morph transitions. Newspaper/Zine defaults to none.

Output: motion preset (duration scale, easing curve, which interactions get animated).

---

## Separate Stage: Content

Not included in the final output

## Final Output: The Build Spec

Everything collected across Stage 0 through Stage 6, plus the content object, compiles into one structured spec handed to the build agent. Three parts:

1. **Tokens**: heading font, body font, type scale, color role map, spacing scale, radius scale, shadow style, border style, blur amount, texture flag, motion preset.
2. **Composition**: ordered array of sections, each with its type, chosen layout variant, and any per-section component overrides.
3. **Content**: copy object per section.

The agent reads this spec and generates the page. No part of the visual decision-making is left to agent judgment; the spec is meant to be complete enough that the agent's job is assembly, not interpretation.