# LandinPage

Design a landing page one decision at a time, then watch an AI agent build it live in your browser.

LandinPage walks you through seven design stages: **Direction → Typography → Color → Surface → Components → Layout → Motion**. Each stage only shows options that fit your earlier choices. Your choices are compiled into a JSON build spec (`tokens`, `composition`, `content`). A build agent turns that spec into a real Vite + React + Tailwind project. The project runs in a [WebContainer](https://webcontainers.io) in your browser, with a file tree, code editor, terminal and live preview. You keep editing the site by chatting with the agent, and you can export it as a zip.

## How it works

```
 ┌──────────────────────── Browser (Client/) ────────────────────────┐
 │                                                                   │
 │  Wizard (7 stages) ──► build spec ──► "Describe your project"     │
 │                                             │                     │
 │                                  sign up / log in (Supabase)      │
 │                                             │                     │
 │  Workspace: chat · file tree · Monaco · terminal · preview        │
 │        ▲                    │                                     │
 │        │   WebContainer (Node + npm + Vite dev server)            │
 │        │        ▲  runs Bash commands, hot-reloads files          │
 └────────┼────────┼─────────────────────────────────────────────────┘
          │ WebSocket (tokens, tool calls, file writes, commands)
 ┌────────┴────────┴──────── API (server/) ──────────────────────────┐
 │  FastAPI · agent loop · Read/Write/Edit/Bash/WebSearch/MCP tools  │
 │  model providers (OpenRouter, Claude, OpenAI, DeepSeek, Kimi)     │
 └────────────────────────────────┬──────────────────────────────────┘
                                  │
                   Supabase (Auth + Postgres: projects,
                   files, chat history, settings, encrypted keys)
```

1. **Design.** The wizard runs entirely in the browser. Selections are saved to `localStorage`.
2. **Describe.** On the review step you describe the site in plain language. If you aren't signed in yet, that message and the spec are stored locally so they survive the sign-in redirect.
3. **Create.** The API creates the project in Supabase. It seeds the project with a starter template (Vite 5, React 18, Tailwind 3) whose design tokens come from your spec.
4. **Build.** The workspace boots a WebContainer, installs dependencies and starts the dev server. Meanwhile the agent writes files over a WebSocket. When the agent calls `Bash`, the server does not run the command itself. It sends the command to your browser, which runs it in the WebContainer and returns the output.
5. **Iterate.** Every later chat message edits the same project. Files and chat history are stored in Supabase. The WebContainer is a disposable runtime.

Supabase is the source of truth. You can reopen a project on any machine and it rebuilds from the stored files.

## Repository layout

| Path | What it is |
| --- | --- |
| [`Client/`](Client/) | React 19 + Vite 8 frontend: marketing site, design wizard, account pages and the project workspace. See [Client/README.md](Client/README.md). |
| [`server/`](server/) | FastAPI backend: auth verification, REST API, the agent loop, the WebSocket and the Supabase schema. See [server/README.md](server/README.md). |
| [`render.yaml`](render.yaml) | Render Blueprint that deploys both services. |

## Quick start

**You'll need** Node.js 20.19+ (or 22.12+), Python 3.11+, [uv](https://docs.astral.sh/uv/), a [Supabase](https://supabase.com) project, and an [OpenRouter](https://openrouter.ai) API key for the free first generations.

```bash
# 1. Database: in the Supabase SQL editor, run these in order
#    server/supabase/migrations/0001_init.sql
#    server/supabase/migrations/0002_portal.sql

# 2. API (terminal 1)
cd server
uv sync
cp .env.example .env        # fill in Supabase, OpenRouter and KEY_ENCRYPTION_SECRET
uv run uvicorn app.main:app --reload --port 8000

# 3. Frontend (terminal 2)
cd Client
npm install
cp .env.example .env        # fill in the Supabase URL and anon key
npm run dev
```

Open http://localhost:5173. The full Supabase setup (auth redirect URLs, Google sign-in, JWT settings) is in [server/README.md](server/README.md#supabase).

> **Browser support:** use a Chromium-based browser or Firefox. The workspace needs a cross-origin isolated page with `COEP: credentialless`, and Safari doesn't support that for WebContainers.

## Models and API keys

- **Free first generations.** Each account gets `FREE_GENERATIONS` first builds (default 3). They run on the platform's OpenRouter key and model (`AGENT_MODEL`, default `anthropic/claude-haiku-4.5`).
- **Bring your own key.** After that, including every edit after a project's first build, the agent uses the user's own key. Users add keys under **Settings → Models & API keys** for Claude, OpenAI, DeepSeek, Kimi or OpenRouter. Keys are encrypted at rest and never sent back to the browser.

## Deployment

### Self-hosting (Docker Compose + Cloudflare Tunnel)

`docker-compose.yml` runs three containers:

- **`api`**: the FastAPI server ([server/Dockerfile](server/Dockerfile)).
- **`web`**: the built frontend served by Caddy with the COOP/COEP headers ([Client/Dockerfile](Client/Dockerfile), [Client/Caddyfile](Client/Caddyfile)).
- **`cloudflared`**: an outbound-only tunnel to Cloudflare. The server needs no open inbound ports, so SSH can stay on Tailscale only.

**1. Create the tunnel** (the domain must be on Cloudflare). In **Zero Trust → Networks → Tunnels → Create a tunnel → Cloudflared**, name it and copy the token from the install command. You don't need to run that command. Then add two public hostnames:

| Public hostname | Service |
| --- | --- |
| `app.example.com` | `HTTP` → `web:80` |
| `api.example.com` | `HTTP` → `api:8000` |

The service names resolve inside the Compose network. WebSockets work through the tunnel by default, and the client pings every 25 s, so Cloudflare's idle timeout won't drop agent runs.

**2. On the server** (over Tailscale SSH), with Docker Engine and the Compose plugin installed:

```bash
git clone <this repo> landinpage && cd landinpage
cp .env.example .env                  # CLOUDFLARE_TUNNEL_TOKEN, VITE_* (VITE_API_URL=https://api.example.com)
cp server/.env.example server/.env    # API secrets; CORS_ORIGINS=https://app.example.com
docker compose up -d --build
docker compose logs -f cloudflared    # should show "Registered tunnel connection"
```

**3. Supabase:** add `https://app.example.com/auth/callback` to the auth redirect URLs and set the Site URL.

**Updating:** `git pull && docker compose up -d --build`. The `VITE_*` values are compiled into the bundle, so rebuild `web` after changing them.

**Debugging on the box:** the API and web containers are bound to `127.0.0.1:8000` and `127.0.0.1:8080`. From your laptop, run `ssh -L 8080:localhost:8080 <tailscale-host>` to reach them without going through Cloudflare.

**Cloudflare settings:** leave Rocket Loader off for these hostnames. It rewrites script tags and can break the app.

### Render

`render.yaml` defines two services:

- **`landinpage-api`**: Python web service running from `server/`, with a health check at `/health`.
- **`landinpage-web`**: static site built from `Client/`, served with the COOP/COEP headers that WebContainers need.

In Render, go to **New → Blueprint** and select this repo. You'll be prompted for the secrets. Set `CORS_ORIGINS` on the API to the frontend URL, and `VITE_API_URL` on the frontend to the API URL. After deploying, add the production callback URL (`https://<your-site>/auth/callback`) to your Supabase redirect URLs.

To host the frontend on Vercel instead, `Client/vercel.json` already sets the SPA rewrite and the cross-origin isolation headers. Skip the `landinpage-web` service in that case.

## Tech stack

**Frontend:** React 19, Vite 8, Tailwind CSS 4, shadcn/ui (Radix), Zustand, React Router 7, Monaco Editor, WebContainer API, Supabase JS.
**Backend:** FastAPI, Uvicorn, OpenAI Python SDK (used for every provider through OpenAI-compatible endpoints), Supabase Python, PyJWT, cryptography (Fernet), MCP Python SDK, ddgs.
**Infrastructure:** Supabase (Auth and Postgres), Docker Compose + Cloudflare Tunnel (self-hosted), or Render and/or Vercel.
