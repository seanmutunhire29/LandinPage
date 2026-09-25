import os
from pathlib import Path

from dotenv import load_dotenv

SERVER_DIR = Path(__file__).resolve().parent.parent
load_dotenv(SERVER_DIR / ".env")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
AGENT_MODEL = os.getenv("AGENT_MODEL", "anthropic/claude-haiku-4.5")
# Output cap per model call. Without it OpenRouter reserves the model maximum (64k for
# Haiku 4.5) against the key's credit limit and can reject the request with a 402.
AGENT_MAX_TOKENS = int(os.getenv("AGENT_MAX_TOKENS", "8000"))

SUPABASE_URL = (os.getenv("SUPABASE_URL") or "").rstrip("/")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET") or None

CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

MCP_CONFIG_PATH = Path(os.getenv("MCP_CONFIG_PATH", SERVER_DIR / "mcp_servers.json"))
