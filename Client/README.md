# LandInPage

A design decision platform for landing pages. Users step through seven stages
(Direction → Typography → Color → Surface → Components → Layout → Motion). Each
stage is filtered by earlier choices. At the end, LandInPage compiles every choice
into a JSON build spec made of `tokens`, `composition` and `content`.

`Categories.md` is the source of truth for stage content and filtering logic.

## Run

```bash
npm install
npm run dev
```

## Where things live

- `src/data/`: stage content (directions, type pairings, palettes, surfaces, components, sections, motion)
- `src/lib/filters.js`: per-direction filtering for every stage
- `src/lib/theme.js`: resolves choices into CSS variables that re-skin shadcn/ui previews
- `src/lib/buildSpec.js`: compiles the store into the final spec
- `src/store/useDesignStore.js`: Zustand store (persisted to localStorage), including downstream invalidation
- `src/pages/onboarding/`: one page per stage, plus the review page

All state is client-side. There is no backend.
