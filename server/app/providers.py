"""Model providers, user API keys, and which key pays for a turn.

Every provider here speaks the OpenAI Chat Completions API (Anthropic through its
OpenAI SDK compatibility endpoint), so the agent loop has one code path.

Key policy: a project's first generation runs on the platform OpenRouter key while
the account has free generations left (config.FREE_GENERATIONS). Every later turn,
and any first generation past the quota, uses the user's own key for the provider
they selected.
"""

import logging
from dataclasses import dataclass

import httpx
from cryptography.fernet import Fernet, InvalidToken
from openai import AsyncOpenAI, DefaultAsyncHttpxClient

from app import config, db

log = logging.getLogger(__name__)


@dataclass(frozen=True)
class Provider:
    id: str
    label: str
    base_url: str
    key_url: str          # where users create a key
    key_hint: str         # placeholder shown in the key input
    models: list[str]     # suggestions; the live list comes from GET /models
    default_model: str
    max_tokens_param: str = "max_tokens"
    notes: str = ""


PROVIDERS: dict[str, Provider] = {
    p.id: p
    for p in [
        Provider(
            id="anthropic",
            label="Claude",
            base_url="https://api.anthropic.com/v1/",
            key_url="https://console.anthropic.com/settings/keys",
            key_hint="sk-ant-...",
            models=["claude-sonnet-5", "claude-opus-5-5", "claude-haiku-4-5"],
            default_model="claude-sonnet-5",
        ),
        Provider(
            id="openai",
            label="OpenAI",
            base_url="https://api.openai.com/v1",
            key_url="https://platform.openai.com/api-keys",
            key_hint="sk-...",
            models=["gpt-5", "gpt-5-mini", "gpt-4.1"],
            default_model="gpt-5-mini",
            # Newer OpenAI models reject max_tokens; max_completion_tokens works on all of them.
            max_tokens_param="max_completion_tokens",
        ),
        Provider(
            id="deepseek",
            label="DeepSeek",
            base_url="https://api.deepseek.com/v1",
            key_url="https://platform.deepseek.com/api_keys",
            key_hint="sk-...",
            models=["deepseek-chat"],
            default_model="deepseek-chat",
            notes="deepseek-reasoner is weak at tool calls; deepseek-chat works best here.",
        ),
        Provider(
            id="kimi",
            label="Kimi",
            base_url="https://api.moonshot.ai/v1",
            key_url="https://platform.moonshot.ai/console/api-keys",
            key_hint="sk-...",
            models=["kimi-k2-turbo-preview", "kimi-k2-0905-preview"],
            default_model="kimi-k2-turbo-preview",
        ),
        Provider(
            id="openrouter",
            label="OpenRouter",
            base_url="https://openrouter.ai/api/v1",
            key_url="https://openrouter.ai/settings/keys",
            key_hint="sk-or-...",
            models=["anthropic/claude-sonnet-5", "anthropic/claude-haiku-4.5", "openai/gpt-5-mini", "deepseek/deepseek-chat", "moonshotai/kimi-k2"],
            default_model="anthropic/claude-haiku-4.5",
        ),
    ]
}

DEFAULT_PROVIDER = "openrouter"

# One connection pool shared by every per-user client.
_http = DefaultAsyncHttpxClient()


def public_registry() -> list[dict]:
    return [
        {
            "id": p.id,
            "label": p.label,
            "key_url": p.key_url,
            "key_hint": p.key_hint,
            "models": p.models,
            "default_model": p.default_model,
            "notes": p.notes,
        }
        for p in PROVIDERS.values()
    ]


# ---------------------------------------------------------------------------
# Key storage
# ---------------------------------------------------------------------------

def _fernet() -> Fernet:
    if not config.KEY_ENCRYPTION_SECRET:
        raise RuntimeError("KEY_ENCRYPTION_SECRET is not set")
    return Fernet(config.KEY_ENCRYPTION_SECRET.encode())


def encrypt_key(key: str) -> str:
    return _fernet().encrypt(key.encode()).decode()


def decrypt_key(token: str) -> str | None:
    try:
        return _fernet().decrypt(token.encode()).decode()
    except InvalidToken:
        # Encrypted under a different secret; the user has to enter it again.
        log.warning("stored API key could not be decrypted")
        return None


def last4(key: str) -> str:
    return key[-4:] if len(key) > 8 else ""


class InvalidKey(Exception):
    pass


async def _get(url: str, headers: dict) -> httpx.Response:
    return await _http.get(url, headers=headers, timeout=15)


def _auth_headers(provider: Provider, key: str) -> dict:
    if provider.id == "anthropic":
        return {"x-api-key": key, "anthropic-version": "2023-06-01"}
    return {"Authorization": f"Bearer {key}"}


async def validate_key(provider: Provider, key: str) -> None:
    """Raise InvalidKey if the provider rejects the key. Network trouble is not
    treated as a bad key."""
    # OpenRouter's /models is public, so check the key endpoint instead.
    url = "https://openrouter.ai/api/v1/key" if provider.id == "openrouter" else provider.base_url.rstrip("/") + "/models"
    try:
        res = await _get(url, _auth_headers(provider, key))
    except httpx.HTTPError as e:
        log.warning("key check for %s failed to connect: %s", provider.id, e)
        return
    if res.status_code in (401, 403):
        raise InvalidKey(f"{provider.label} rejected this key.")


_OPENAI_CHAT_PREFIXES = ("gpt-", "o1", "o3", "o4", "chatgpt-")
_OPENAI_EXCLUDE = ("audio", "realtime", "tts", "transcribe", "image", "search", "embedding", "instruct")


async def list_models(provider: Provider, key: str | None) -> list[dict]:
    """Chat models from the provider's live /models list, as [{id, name}]."""
    headers = _auth_headers(provider, key) if key else {}
    res = await _get(provider.base_url.rstrip("/") + "/models", headers)
    if res.status_code in (401, 403):
        raise InvalidKey(f"{provider.label} rejected the saved key.")
    res.raise_for_status()
    items = res.json().get("data", [])
    models = []
    for m in items:
        mid = m.get("id")
        if not mid:
            continue
        if provider.id == "openai" and (not mid.startswith(_OPENAI_CHAT_PREFIXES) or any(x in mid for x in _OPENAI_EXCLUDE)):
            continue
        if provider.id == "openrouter" and "tools" not in (m.get("supported_parameters") or []):
            continue
        models.append({"id": mid, "name": m.get("display_name") or m.get("name") or mid})
    models.sort(key=lambda m: m["id"])
    return models


# ---------------------------------------------------------------------------
# Which model and key run a turn
# ---------------------------------------------------------------------------

@dataclass
class ResolvedModel:
    client: AsyncOpenAI
    provider: Provider
    model: str
    source: str  # "platform" | "user"

    @property
    def max_tokens_param(self) -> str:
        return self.provider.max_tokens_param

    def describe(self) -> dict:
        return {"provider": self.provider.id, "label": self.provider.label, "model": self.model, "source": self.source}


class KeyRequired(Exception):
    """The turn needs the user's own key and they haven't added one.

    reason: "tweak"              the project's first generation is done
            "quota"              the account's free generations are used up
            "platform_depleted"  the platform key ran out of credit
            "invalid_key"        the stored key can't be used any more
    """

    def __init__(self, provider: Provider, reason: str):
        self.provider = provider
        self.reason = reason
        super().__init__(f"{provider.label} key required ({reason})")


def platform_model() -> ResolvedModel | None:
    if not config.OPENROUTER_API_KEY:
        return None
    provider = PROVIDERS["openrouter"]
    client = AsyncOpenAI(api_key=config.OPENROUTER_API_KEY, base_url=config.OPENROUTER_BASE_URL, http_client=_http)
    return ResolvedModel(client=client, provider=provider, model=config.AGENT_MODEL, source="platform")


async def selected(user_id: str) -> tuple[Provider, str]:
    settings = await db.get_settings(user_id)
    provider = PROVIDERS.get(settings.get("provider") or "") or PROVIDERS[DEFAULT_PROVIDER]
    model = settings.get("model") if settings.get("provider") == provider.id and settings.get("model") else provider.default_model
    return provider, model


async def user_model(user_id: str, reason: str) -> ResolvedModel:
    provider, model = await selected(user_id)
    token = await db.get_encrypted_key(user_id, provider.id)
    if token is None:
        raise KeyRequired(provider, reason)
    key = decrypt_key(token)
    if key is None:
        raise KeyRequired(provider, "invalid_key")
    client = AsyncOpenAI(api_key=key, base_url=provider.base_url, http_client=_http)
    return ResolvedModel(client=client, provider=provider, model=model, source="user")


async def resolve_for_turn(user_id: str, project_id: str, first_generation: bool) -> ResolvedModel:
    if first_generation:
        platform = platform_model()
        if platform and await db.claim_free_generation(user_id, project_id, config.FREE_GENERATIONS):
            return platform
        return await user_model(user_id, "quota" if platform else "platform_depleted")
    return await user_model(user_id, "tweak")


def is_first_generation(project: dict, rows: list[dict]) -> bool:
    """A project is on its first generation until one turn has finished: a
    stored assistant message without tool calls is the end of a turn."""
    if project.get("platform_generation") == "done":
        return False
    return not any(r["role"] == "assistant" and not r.get("tool_calls") for r in rows)


async def free_generation_available(user_id: str, project: dict, rows: list[dict]) -> bool:
    """Whether the project's next turn can run on the platform key. The server
    re-checks when the turn actually starts."""
    if not config.OPENROUTER_API_KEY or not is_first_generation(project, rows):
        return False
    if project.get("platform_generation") == "reserved":
        return True
    settings = await db.get_settings(user_id)
    return settings.get("free_generations_used", 0) < config.FREE_GENERATIONS
