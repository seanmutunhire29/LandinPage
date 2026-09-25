# LandInPage server

FastAPI backend: Supabase auth verification, persistence, the agent loop, and the
WebSocket that streams agent output to the browser and bridges Bash commands into
the user's WebContainer.

## Setup

```bash
cd server
uv sync
cp .env.example .env   # fill in values, see below
uv run uvicorn app.main:app --reload --port 8000
```

### Supabase

1. Create a project at supabase.com.
2. **SQL editor** → paste and run `supabase/migrations/0001_init.sql`.
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

`mcp_servers.json` lists MCP servers whose tools are exposed to the agent. See the file for the format.
