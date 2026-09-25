# LandInPage server

FastAPI backend: Supabase auth verification, persistence, the agent loop, and the
WebSocket that streams agent output to the browser and bridges Bash commands into
the user's WebContainer.

## Running the whole app

```bash
# terminal 1: API
cd server && uv run uvicorn app.main:app --reload --port 8000
# terminal 2: frontend (serves the COOP/COEP headers WebContainers need)
cd Client && cp .env.example .env && npm run dev
```

Flow: wizard → "Describe your project" chat → sign up / log in (email or Google) →
project created in Supabase → `/projects/:id` workspace boots a WebContainer, the agent
generates the site live, further messages edit it. Use a Chromium-based browser or Firefox
(WebContainers with `credentialless` COEP aren't supported in Safari).

## Setup

```bash
cd server
uv sync
cp .env.example .env   # fill in values, see below
uv run uvicorn app.main:app --reload --port 8000
```

### Supabase

1. Create a project at supabase.com.
2. **SQL editor** → paste and run `supabase/migrations/0001_init.sql`, then `0002_portal.sql`
   (profiles, model settings, encrypted user API keys, free-generation quota).
3. **Project Settings → API**: copy the URL and the `service_role` key into `server/.env`,
   and the URL and `anon` key into `Client/.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. **Project Settings → API → JWT**: if the project still uses the legacy JWT secret, copy it into
   `SUPABASE_JWT_SECRET`. Projects on the newer signing keys are verified via JWKS with no extra config.
5. **Authentication → URL Configuration**: set Site URL to `http://localhost:5173` and add
   `http://localhost:5173/auth/callback` to Redirect URLs.
6. **Authentication → Providers → Google**: enable it and paste a Google OAuth client ID/secret
   (Google Cloud Console → Credentials → OAuth client ID, type "Web application", authorized
   redirect URI = the callback URL Supabase shows on that page).
7. Optional: **Authentication → Providers → Email** → turn off "Confirm email" for a
   frictionless local dev loop.

### MCP servers

`mcp_servers.json` lists MCP servers whose tools are exposed to the agent as `mcp__<server>__<tool>`.
Servers connect at startup; one that fails to start is logged and skipped.

```json
{
  "mcpServers": {
    "fetch":  { "command": "uvx", "args": ["mcp-server-fetch"] },
    "remote": { "url": "https://example.com/mcp" },
    "paused": { "command": "npx", "args": ["some-server"], "disabled": true }
  }
}
```

### Models and API keys

Users pick a provider (Claude, OpenAI, DeepSeek, Kimi, OpenRouter) and model under
**Settings → Models & API keys**, and save their own key per provider (`app/providers.py`).

- A project's first generation runs on `OPENROUTER_API_KEY` / `AGENT_MODEL`, up to
  `FREE_GENERATIONS` projects per account. If that key is out of credit, the turn falls back
  to the user's key when they have one.
- Every later turn (edits) runs on the user's own key for their selected provider and model.
- Keys are encrypted with `KEY_ENCRYPTION_SECRET` (Fernet) and never returned to the browser.
  Changing the secret makes saved keys unreadable; users are asked to enter them again.

## Agent

`app/agent/loop.py` (the evolved `main.py`) runs one chat turn per call:
Read / Write / Edit persist to `project_files`, Bash is bridged to the browser's
WebContainer over the WebSocket, WebSearch uses DuckDuckGo, plus any MCP tools.
Generated projects start from `app/agent/template.py` (Vite 5 + React + Tailwind 3,
tokens from the design spec).
