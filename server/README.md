# LandinPage: Server

The LandinPage backend is a FastAPI app. It is responsible for:

- verifying **Supabase auth** tokens (JWKS or the legacy HS256 secret)
- **persisting** projects, files, chat history, profiles, model settings and encrypted API keys in Supabase Postgres
- running the **agent loop**, which turns a design spec and chat messages into a working Vite + React + Tailwind site
- running a **WebSocket** per project that streams agent output to the browser and sends `Bash` commands to the user's WebContainer

For the big picture, see the [root README](../README.md). The frontend is documented in [Client/README.md](../Client/README.md).

## Getting started

Requires Python 3.11+ and [uv](https://docs.astral.sh/uv/).

```bash
uv sync
cp .env.example .env   # fill in values, see below
uv run uvicorn app.main:app --reload --port 8000
```

Check it's running with `curl localhost:8000/health`, which returns `{"ok": true}`. Interactive API docs are at http://localhost:8000/docs.

To run the whole app, start the frontend in a second terminal:

```bash
cd ../Client && npm install && cp .env.example .env && npm run dev
```

### Environment variables

| Variable | Default | Description |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | | Platform key that pays for free first generations. Without it, users always need their own key. |
| `OPENROUTER_BASE_URL` | `https://openrouter.ai/api/v1` | |
| `AGENT_MODEL` | `anthropic/claude-haiku-4.5` | Model used for free generations. |
| `AGENT_MAX_TOKENS` | `8000` | Output cap per model call. Lower it if OpenRouter returns 402 "can only afford N tokens". |
| `FREE_GENERATIONS` | `3` | Free first generations per account. |
| `KEY_ENCRYPTION_SECRET` | | Fernet key used to encrypt user API keys. Required to save keys. |
| `SUPABASE_URL` | | `https://<project>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | | Service role key. Server-side only. |
| `SUPABASE_JWT_SECRET` | | Only needed if the project still signs JWTs with the legacy HS256 secret. |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated list of allowed frontend origins. |
| `MCP_CONFIG_PATH` | `mcp_servers.json` | Path to the MCP server config. |

Generate an encryption secret:

```bash
uv run python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

> Changing `KEY_ENCRYPTION_SECRET` makes saved keys unreadable. Affected users are asked to enter their keys again.

## Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. In the **SQL editor**, run `supabase/migrations/0001_init.sql`, then `0002_portal.sql`.
3. From **Project Settings → API**, copy the URL and `service_role` key into `server/.env`. Copy the URL and `anon` key into `Client/.env` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. In **Project Settings → API → JWT**: if the project still uses the legacy JWT secret, copy it into `SUPABASE_JWT_SECRET`. Projects on the newer asymmetric signing keys are verified through JWKS with no extra config.
5. In **Authentication → URL Configuration**, set the Site URL to `http://localhost:5173` and add `http://localhost:5173/auth/callback` to the Redirect URLs. Add the production equivalents when you deploy.
6. In **Authentication → Providers → Google**, enable Google and paste an OAuth client ID and secret. Create them in Google Cloud Console under **Credentials → OAuth client ID** with type "Web application". The authorized redirect URI is the callback URL Supabase shows on that page.
7. Optional: in **Authentication → Providers → Email**, turn off "Confirm email" for a faster local dev loop.

### Data model

| Table | Contents |
| --- | --- |
| `projects` | Owner, name, `design_spec` (jsonb), `platform_generation` (`reserved` / `done`) |
| `project_files` | One row per file (`project_id`, `file_path`, `content`) |
| `chat_messages` | Ordered conversation: `user` / `assistant` / `tool` roles, `tool_calls`, `tool_call_id` |
| `profiles` | Username, display name, bio, avatar, website, location |
| `user_settings` | Selected provider and model, `free_generations_used` |
| `user_api_keys` | Fernet-encrypted key and its last 4 characters, per provider |

The backend uses the service role and enforces ownership itself. RLS policies protect direct access with the anon key. `user_api_keys` has no policy, so only the service role can read it. The `claim_free_generation()` function reserves a free generation atomically, and retrying a project that already holds a reservation doesn't count twice.

## API

All endpoints except `/health` and `/providers` require `Authorization: Bearer <supabase access token>`.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Liveness check |
| `GET` | `/me` | Current user id and email |
| `GET` | `/projects` | List the user's projects |
| `POST` | `/projects` | Create a project from `{design_spec, first_message, name?}`. Seeds the template and stores the first message as a pending turn. |
| `GET` | `/projects/{id}` | Project with its files and messages |
| `GET` / `PATCH` | `/me/profile` | Read or update the profile (created on first read) |
| `GET` / `PATCH` | `/me/settings` | Selected provider and model, free-generation usage, saved keys (last 4 only) |
| `PUT` / `DELETE` | `/me/keys/{provider}` | Save (validated against the provider first) or remove an API key |
| `GET` | `/providers` | Provider registry: labels, key URLs, suggested models |
| `GET` | `/providers/{provider}/models` | Live model list using the user's key |

### WebSocket: `/ws/projects/{id}`

The first message must be `{"type": "auth", "token": "..."}` and must arrive within 15 seconds. If it doesn't, the socket closes with code `4401`. An unknown project closes with `4404`.

| Direction | Events |
| --- | --- |
| client → server | `chat {content}`, `resume` (run the pending first message), `file_save {path, content}`, `command_result {id, exit_code, output, error?}`, `ping` |
| server → client | `ready`, `user_message`, `turn_start {model}`, `token`, `assistant_message`, `tool_start`, `tool_result`, `file_write`, `command`, `command_cancel`, `turn_done`, `error {message, code?}`, `pong` |

Only one turn runs per project at a time, across all connections. If the socket drops, the running turn still finishes and everything it writes is saved. Pending `Bash` commands fail immediately. The full protocol, including error codes, is documented at the top of [`app/routes/ws.py`](app/routes/ws.py).

## The agent

[`app/agent/loop.py`](app/agent/loop.py) runs one chat turn per call, with up to 30 model round-trips per turn. It uses these tools:

| Tool | Behaviour |
| --- | --- |
| `Read` | Reads a file from `project_files` |
| `Write` / `Edit` | Saves to `project_files` and streams a `file_write` event to the browser |
| `Bash` | Runs in the **browser's** WebContainer through [`bridge.py`](app/agent/bridge.py), not on the server. Times out after 180 seconds. |
| `WebSearch` | DuckDuckGo through `ddgs`. No API key needed. |
| `mcp__<server>__<tool>` | Any tools from configured MCP servers |

New projects start from [`app/agent/template.py`](app/agent/template.py): Vite 5, React 18 and Tailwind 3. That toolchain is pure JavaScript and runs reliably in WebContainers; Tailwind 4 and Vite 8 depend on native binaries. `src/styles/tokens.css` and `index.html` are generated from the design spec, and fonts are linked from Google Fonts. The system prompt is in [`app/agent/prompts.py`](app/agent/prompts.py).

### Models and key policy

Every provider is called through the OpenAI Chat Completions API. Anthropic is reached through its OpenAI-compatible endpoint, so the loop has a single code path. Providers are defined in [`app/providers.py`](app/providers.py): **Claude, OpenAI, DeepSeek, Kimi and OpenRouter**.

- A project's **first generation** runs on `OPENROUTER_API_KEY` / `AGENT_MODEL` while the account has free generations left.
- If the platform key runs out of credit mid-turn (HTTP 402), the turn switches to the user's own key when they have one.
- **Every later turn** (edits), and any first generation past the quota, uses the user's own key for their selected provider and model. When no key is available, the client receives an `error` with `code: "key_required"` and a reason (`tweak`, `quota` or `platform_depleted`).
- Keys are validated before saving, encrypted with Fernet, and never returned to the browser.

### MCP servers

`mcp_servers.json` lists MCP servers to connect to at startup. A server that fails to start is logged and skipped.

```json
{
  "mcpServers": {
    "fetch":  { "command": "uvx", "args": ["mcp-server-fetch"] },
    "remote": { "url": "https://example.com/mcp" },
    "paused": { "command": "npx", "args": ["some-server"], "disabled": true }
  }
}
```

## Project structure

```
app/
├── main.py              FastAPI app, CORS, lifespan (starts and stops MCP servers)
├── config.py            Environment config
├── auth.py              Supabase JWT verification, current_user dependency
├── db.py                Supabase data access
├── providers.py         Provider registry, key encryption, per-turn model resolution
├── routes/
│   ├── projects.py      /projects
│   ├── account.py       /me/*, /providers
│   └── ws.py            /ws/projects/{id}
├── agent/
│   ├── loop.py          Agent loop and tool handlers
│   ├── bridge.py        Bash ↔ WebContainer command bridge
│   ├── prompts.py       System prompt built from the design spec
│   └── template.py      Starter project files generated from the spec
└── integrations/
    ├── mcp_client.py    MCP server manager
    └── search.py        DuckDuckGo web search
supabase/migrations/     SQL schema, run in order
mcp_servers.json         MCP server config
```

## Deployment

The `landinpage-api` service in [`../render.yaml`](../render.yaml) builds with `uv sync --frozen` and starts with:

```bash
uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Set the secrets when prompted. Set `CORS_ORIGINS` to your frontend origin(s). Any other host that runs a Python ASGI app works as well, as long as it supports WebSockets.
