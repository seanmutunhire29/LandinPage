# LandinPage: Client

The LandinPage frontend is a React 19 + Vite 8 single-page app. It contains:

- **Marketing site** (`/`)
- **Design wizard** (`/onboarding/*`): seven stages that compile into a JSON build spec
- **Account pages**: profile with the projects list, settings, and model/API-key management
- **Workspace** (`/projects/:id`): chat with the build agent next to a file tree, Monaco editor, terminal and live preview. All of it runs in a WebContainer in the browser.

For the big picture, see the [root README](../README.md). The backend is documented in [server/README.md](../server/README.md).

## Getting started

Requires Node.js 20.19+ or 22.12+ (Vite 8).

```bash
npm install
cp .env.example .env   # fill in the values below
npm run dev            # http://localhost:5173
```

The wizard works without a backend. To create projects and use the workspace, the API must be running on `VITE_API_URL` (see [server/README.md](../server/README.md)).

### Environment variables

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL (**Project Settings → API**). |
| `VITE_SUPABASE_ANON_KEY` | The anon/publishable key. **Never** use the service role key here. |
| `VITE_API_URL` | FastAPI backend URL, for example `http://localhost:8000`. The WebSocket URL is derived from it. |

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with cross-origin isolation headers |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally, with the same headers |
| `npm run lint` | Lint with [oxlint](https://oxc.rs) |

## Routes

| Path | Page | Auth |
| --- | --- | --- |
| `/` | Marketing landing page | |
| `/onboarding/:stage` | Wizard: `direction`, `typography`, `color`, `surface`, `components`, `layout`, `motion`, `review` | |
| `/auth/callback` | Supabase OAuth / email-confirmation landing | |
| `/profile` | Profile and projects list (`/projects` and `/login` redirect here) | ✓ |
| `/settings/:section` | Profile, account, and models & API keys | ✓ |
| `/projects/:projectId` | Workspace (lazy-loaded, so Monaco and WebContainer code only load here) | ✓ |

## Project structure

```
src/
├── App.jsx                 Routes
├── main.jsx                Entry point
├── index.css               Tailwind 4 theme, brand tokens, shadcn variables
├── data/                   Wizard content: directions, typography, palettes,
│                           surfaces, components, sections, motion, stage registry
├── lib/
│   ├── filters.js          Per-direction filtering for every stage
│   ├── theme.js            Resolves choices into CSS variables that re-skin previews
│   ├── buildSpec.js        Compiles the store into the final build spec
│   ├── api.js              REST client (attaches the Supabase access token)
│   ├── agentSocket.js      WebSocket client for the agent channel
│   ├── pendingProject.js   Holds the first message and spec across the sign-in redirect
│   ├── providers.js        Provider tile colours and marks (metadata comes from GET /providers)
│   ├── exportZip.js        Zip export of project files
│   └── supabase.js         Supabase client
├── store/
│   ├── useDesignStore.js   Wizard selections (persisted, with downstream invalidation)
│   ├── useAuthStore.js     Supabase session
│   ├── useAccountStore.js  Profile, settings and saved keys
│   └── useWorkspaceStore.js  Open project: files, chat, terminal, build progress
├── webcontainer/
│   ├── container.js        Boots and tears down one WebContainer per project
│   └── runtime.js          Mounts files, runs npm install and the dev server, runs agent commands
├── pages/                  Marketing, onboarding/*, Profile, Settings, Workspace, AuthCallback
└── components/
    ├── ui/                 shadcn/ui primitives
    ├── brand/              Brand button, field, segmented control, surfaces
    ├── marketing/          Landing page sections
    ├── wizard/             Wizard layout, navigation, progress, option cards
    ├── previews/           Live samples for directions, surfaces, components, motion
    ├── chat/               Chat panel, message list, input, model picker, key notices
    ├── workspace/          File tree, code editor, terminal, preview, build progress, export
    ├── settings/           Settings sections
    ├── auth/               Auth dialog, route guard, user menu
    └── account/, projects/ Header, avatar, project cards
```

`Categories.md` is the source of truth for wizard content. It defines each stage's options, how earlier choices filter later ones, and the shape of the build spec.

## How it works

### The wizard and the build spec

The first stage is **Direction**, one of 20 named visual systems such as Minimal/Swiss, Brutalist or Glassmorphic. Each direction stores defaults for every later stage. `lib/filters.js` uses the chosen direction to narrow the options on each later stage. Changing an early choice clears any later choices it makes incompatible. That logic lives in `useDesignStore`.

Previews on every stage are real components re-skinned by `lib/theme.js`, which turns the current selections into CSS variables. On the review step, `lib/buildSpec.js` compiles everything into:

- `tokens`: typography, color roles, spacing, radius, shadow, border, blur, texture, motion, component variants
- `composition`: ordered page sections and their layouts
- `content`: placeholder for now (the content stage isn't designed yet); sections that need copy are flagged `contentBearing`

### From spec to project

On the review step the user describes their site. If they aren't signed in, `pendingProject.js` saves the message and spec to `localStorage`. The auth dialog opens, and after sign-in (email or Google) the project is created with `POST /projects` and the app navigates to the workspace.

### The workspace

`useProjectSession` connects to `ws://…/ws/projects/:id` and authenticates with the Supabase access token. It then:

- streams agent tokens and tool calls into the chat, with a card per tool call
- applies `file_write` events to the file tree, editor and WebContainer
- runs `command` events in the WebContainer through `jsh` and sends back `command_result`
- sends user edits from the editor back as `file_save`

`webcontainer/runtime.js` mounts the project files and runs `npm install`. It keeps the Vite dev server running and shows its URL in the preview iframe. Commands run one at a time after the initial install, and their output streams to the terminal panel. Build progress is driven by both agent events and runtime events.

The protocol is documented in [`server/app/routes/ws.py`](../server/app/routes/ws.py).

### Cross-origin isolation

WebContainers need `SharedArrayBuffer`, so the page must be cross-origin isolated:

```
Cross-Origin-Embedder-Policy: credentialless
Cross-Origin-Opener-Policy: same-origin
```

`credentialless` lets third-party resources such as Google Fonts keep loading. These headers are set in `vite.config.js` (dev and preview), `vercel.json` and `../render.yaml`. **Any host you deploy to must send them.** Safari isn't supported. Use Chromium or Firefox.

## Deployment

- **Vercel:** import the repo with `Client` as the root directory. `vercel.json` handles the SPA rewrite and the headers. Set the three `VITE_*` variables.
- **Render:** the `landinpage-web` service in `../render.yaml` builds with `npm ci && npm run build` and publishes `dist/`.

`VITE_*` variables are baked in at build time, so rebuild after you change them. Add `https://<your-domain>/auth/callback` to Supabase's redirect URLs.

## Adding UI primitives

The project uses shadcn/ui (`components.json`, style `radix-nova`, JSX, `@/` alias):

```bash
npx shadcn@latest add <component>
```
