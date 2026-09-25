"""User portal: profile, model settings, and API keys. Plaintext keys are only
ever received here; responses carry the provider and last four characters."""

import logging
import re

import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator

from app import config, db
from app.auth import User, current_user
from app.providers import PROVIDERS, InvalidKey, decrypt_key, encrypt_key, last4, list_models, public_registry, selected, validate_key

log = logging.getLogger(__name__)
router = APIRouter(tags=["account"])

USERNAME_RE = re.compile(r"^[a-z0-9_]{3,30}$")


def _provider(provider_id: str):
    provider = PROVIDERS.get(provider_id)
    if provider is None:
        raise HTTPException(404, f"Unknown provider: {provider_id}")
    return provider


def _url(value: str) -> str:
    value = value.strip()
    if value and not re.match(r"^https?://", value):
        value = "https://" + value
    if len(value) > 300:
        raise ValueError("URL is too long")
    return value


# ---- profile ----

class ProfileUpdate(BaseModel):
    username: str | None = None
    display_name: str | None = Field(default=None, max_length=80)
    bio: str | None = Field(default=None, max_length=160)
    avatar_url: str | None = None
    website: str | None = None
    location: str | None = Field(default=None, max_length=80)

    @field_validator("username")
    @classmethod
    def _username(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip().lower()
        if not USERNAME_RE.match(v):
            raise ValueError("Use 3-30 lowercase letters, numbers or underscores")
        return v

    @field_validator("avatar_url", "website")
    @classmethod
    def _urls(cls, v: str | None) -> str | None:
        return None if v is None else _url(v)

    @field_validator("display_name", "bio", "location")
    @classmethod
    def _strip(cls, v: str | None) -> str | None:
        return None if v is None else v.strip()


@router.get("/me/profile")
async def get_profile(user: User = Depends(current_user)):
    profile = await db.get_or_create_profile(user.id, user.email, user.metadata)
    return {**profile, "email": user.email, "stats": await db.profile_stats(user.id)}


@router.patch("/me/profile")
async def update_profile(body: ProfileUpdate, user: User = Depends(current_user)):
    await db.get_or_create_profile(user.id, user.email, user.metadata)
    fields = body.model_dump(exclude_none=True)
    try:
        profile = await db.update_profile(user.id, fields) if fields else await db.get_profile(user.id)
    except db.UsernameTaken:
        raise HTTPException(409, "That username is taken") from None
    return {**profile, "email": user.email, "stats": await db.profile_stats(user.id)}


# ---- model settings ----

class SettingsUpdate(BaseModel):
    provider: str
    model: str = Field(min_length=1, max_length=200)


async def _settings_payload(user_id: str) -> dict:
    settings = await db.get_settings(user_id)
    provider, model = await selected(user_id)
    return {
        "provider": provider.id,
        "model": model,
        "free_generations": {
            "used": min(settings.get("free_generations_used", 0), config.FREE_GENERATIONS),
            "limit": config.FREE_GENERATIONS if config.OPENROUTER_API_KEY else 0,
        },
        "platform_model": config.AGENT_MODEL,
        "keys": await db.list_keys(user_id),
    }


@router.get("/me/settings")
async def get_settings(user: User = Depends(current_user)):
    return await _settings_payload(user.id)


@router.patch("/me/settings")
async def update_settings(body: SettingsUpdate, user: User = Depends(current_user)):
    _provider(body.provider)
    await db.update_settings(user.id, body.provider, body.model.strip())
    return await _settings_payload(user.id)


# ---- API keys ----

class KeyBody(BaseModel):
    api_key: str = Field(min_length=8, max_length=500)


@router.put("/me/keys/{provider_id}")
async def save_key(provider_id: str, body: KeyBody, user: User = Depends(current_user)):
    provider = _provider(provider_id)
    key = body.api_key.strip()
    try:
        await validate_key(provider, key)
    except InvalidKey as e:
        raise HTTPException(400, str(e)) from None
    try:
        encrypted = encrypt_key(key)
    except RuntimeError:
        log.error("KEY_ENCRYPTION_SECRET is not set; cannot store API keys")
        raise HTTPException(503, "The server isn't set up to store API keys yet (KEY_ENCRYPTION_SECRET).") from None
    await db.upsert_key(user.id, provider.id, encrypted, last4(key))
    return await _settings_payload(user.id)


@router.delete("/me/keys/{provider_id}")
async def delete_key(provider_id: str, user: User = Depends(current_user)):
    provider = _provider(provider_id)
    await db.delete_key(user.id, provider.id)
    return await _settings_payload(user.id)


# ---- providers ----

@router.get("/providers")
async def providers():
    return public_registry()


@router.get("/providers/{provider_id}/models")
async def provider_models(provider_id: str, user: User = Depends(current_user)):
    provider = _provider(provider_id)
    token = await db.get_encrypted_key(user.id, provider.id)
    key = decrypt_key(token) if token else None
    if key is None:
        if provider.id == "openrouter":
            key = config.OPENROUTER_API_KEY  # OpenRouter's model list doesn't need the user's key
        else:
            return {"models": [], "live": False}
    try:
        return {"models": await list_models(provider, key), "live": True}
    except InvalidKey as e:
        raise HTTPException(400, str(e)) from None
    except httpx.HTTPError as e:
        log.warning("model list for %s failed: %s", provider.id, e)
        raise HTTPException(502, f"Couldn't load models from {provider.label}.") from None
