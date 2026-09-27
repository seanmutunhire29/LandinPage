"""Platform settings admins can change at runtime (app_settings table).

Anything not stored falls back to the env defaults in app.config. Values are
cached in memory; the API runs a single worker, so invalidating on write keeps
the cache correct.
"""

import time
from typing import Any

from app import config, db

DEFAULTS: dict[str, Any] = {
    "platform_provider": "openrouter",
    "platform_model": config.AGENT_MODEL,
    # {provider_id: {"encrypted": Fernet token, "last4": str}}. Never sent to the browser.
    "platform_keys": {},
    "free_generations": config.FREE_GENERATIONS,
    "default_token_budget": config.DEFAULT_TOKEN_BUDGET,
    "max_tokens": config.AGENT_MAX_TOKENS,
    "platform_enabled": True,
    "system_prompt": None,  # None = the built-in prompt in app.agent.prompts
    "announcement": {"enabled": False, "message": "", "level": "info"},
}

PLATFORM_KEYS = ("platform_provider", "platform_model", "free_generations", "default_token_budget", "max_tokens", "platform_enabled")

_TTL = 30.0
_cache: dict[str, Any] | None = None
_loaded_at = 0.0


async def get_all() -> dict[str, Any]:
    global _cache, _loaded_at
    if _cache is None or time.monotonic() - _loaded_at > _TTL:
        stored = await db.get_app_settings()
        _cache = {**DEFAULTS, **{k: v for k, v in stored.items() if k in DEFAULTS}}
        _loaded_at = time.monotonic()
    return _cache


async def get(key: str) -> Any:
    return (await get_all())[key]


async def save(key: str, value: Any, admin_id: str) -> None:
    global _cache
    if key not in DEFAULTS:
        raise KeyError(key)
    await db.set_app_setting(key, value, admin_id)
    _cache = None


async def reset(key: str) -> None:
    global _cache
    await db.delete_app_setting(key)
    _cache = None


async def effective_free_limit(user_settings: dict) -> int:
    override = user_settings.get("free_generations_limit")
    return override if override is not None else await get("free_generations")


async def effective_token_budget(user_settings: dict) -> int:
    """Platform tokens the account may use in total; 0 means unlimited."""
    override = user_settings.get("token_budget")
    return override if override is not None else await get("default_token_budget")


async def budget_left(user_id: str, user_settings: dict) -> bool:
    budget = await effective_token_budget(user_settings)
    return budget == 0 or await db.platform_tokens_used(user_id) < budget
