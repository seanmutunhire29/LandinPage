"""Supabase Postgres access. Uses the service role key, so every helper that takes
a user_id enforces ownership itself."""

import re
import secrets
from typing import Any

from postgrest.exceptions import APIError
from supabase import AsyncClient, acreate_client

from app import config

_client: AsyncClient | None = None


async def client() -> AsyncClient:
    global _client
    if _client is None:
        if not (config.SUPABASE_URL and config.SUPABASE_SERVICE_ROLE_KEY):
            raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        _client = await acreate_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)
    return _client


# ---- projects ----

async def create_project(user_id: str, name: str, design_spec: dict) -> dict:
    db = await client()
    res = await db.table("projects").insert({"user_id": user_id, "name": name, "design_spec": design_spec}).execute()
    return res.data[0]


async def list_projects(user_id: str) -> list[dict]:
    db = await client()
    res = await (
        db.table("projects")
        .select("id, name, created_at, updated_at, platform_generation")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    )
    return res.data


async def get_project(project_id: str, user_id: str) -> dict | None:
    db = await client()
    res = await db.table("projects").select("*").eq("id", project_id).eq("user_id", user_id).limit(1).execute()
    return res.data[0] if res.data else None


# ---- files ----

async def list_files(project_id: str) -> list[dict]:
    db = await client()
    res = await db.table("project_files").select("file_path, content, updated_at").eq("project_id", project_id).order("file_path").execute()
    return res.data


async def get_file(project_id: str, file_path: str) -> dict | None:
    db = await client()
    res = await db.table("project_files").select("file_path, content").eq("project_id", project_id).eq("file_path", file_path).limit(1).execute()
    return res.data[0] if res.data else None


async def upsert_files(project_id: str, files: dict[str, str]) -> None:
    if not files:
        return
    db = await client()
    rows = [{"project_id": project_id, "file_path": p, "content": c} for p, c in files.items()]
    await db.table("project_files").upsert(rows, on_conflict="project_id,file_path").execute()


async def upsert_file(project_id: str, file_path: str, content: str) -> None:
    await upsert_files(project_id, {file_path: content})


# ---- chat messages ----

async def list_messages(project_id: str) -> list[dict]:
    db = await client()
    res = await db.table("chat_messages").select("*").eq("project_id", project_id).order("id").execute()
    return res.data


async def add_message(
    project_id: str,
    role: str,
    content: str,
    tool_calls: list[dict[str, Any]] | None = None,
    tool_call_id: str | None = None,
) -> dict:
    db = await client()
    row = {"project_id": project_id, "role": role, "content": content or ""}
    if tool_calls:
        row["tool_calls"] = tool_calls
    if tool_call_id:
        row["tool_call_id"] = tool_call_id
    res = await db.table("chat_messages").insert(row).execute()
    return res.data[0]


async def mark_generation_done(project_id: str) -> None:
    db = await client()
    await db.table("projects").update({"platform_generation": "done"}).eq("id", project_id).execute()


async def claim_free_generation(user_id: str, project_id: str, limit: int) -> bool:
    db = await client()
    res = await db.rpc("claim_free_generation", {"p_user": user_id, "p_project": project_id, "p_limit": limit}).execute()
    return bool(res.data)


# ---- profiles ----

PROFILE_FIELDS = "user_id, username, display_name, bio, avatar_url, website, location, created_at, updated_at"


class UsernameTaken(Exception):
    pass


def _is_unique_violation(e: APIError) -> bool:
    return getattr(e, "code", None) == "23505"


def _username_seed(email: str | None, metadata: dict) -> str:
    raw = (email or "").split("@")[0] or metadata.get("full_name") or "user"
    name = re.sub(r"[^a-z0-9_]", "", raw.lower().replace(".", "_").replace("-", "_").replace(" ", "_"))[:24]
    return name if len(name) >= 3 else f"user_{name}"


async def get_profile(user_id: str) -> dict | None:
    db = await client()
    res = await db.table("profiles").select(PROFILE_FIELDS).eq("user_id", user_id).limit(1).execute()
    return res.data[0] if res.data else None


async def get_or_create_profile(user_id: str, email: str | None, metadata: dict) -> dict:
    """The profile row, created on first use from the sign-in provider's metadata."""
    profile = await get_profile(user_id)
    if profile:
        return profile
    db = await client()
    base = _username_seed(email, metadata)
    row = {
        "user_id": user_id,
        "display_name": (metadata.get("full_name") or metadata.get("name") or "")[:80],
        "avatar_url": metadata.get("avatar_url") or metadata.get("picture") or "",
    }
    for attempt in range(5):
        row["username"] = base if attempt == 0 else f"{base}_{secrets.token_hex(2)}"
        try:
            await db.table("profiles").insert(row).execute()
            break
        except APIError as e:
            if not _is_unique_violation(e):
                raise
            # Either the username is taken or a concurrent request created this user's row.
            if profile := await get_profile(user_id):
                return profile
    return await get_profile(user_id)


async def update_profile(user_id: str, fields: dict) -> dict:
    db = await client()
    try:
        await db.table("profiles").update(fields).eq("user_id", user_id).execute()
    except APIError as e:
        if _is_unique_violation(e):
            raise UsernameTaken() from e
        raise
    return await get_profile(user_id)


async def profile_stats(user_id: str) -> dict:
    db = await client()
    projects = await db.table("projects").select("id", count="exact", head=True).eq("user_id", user_id).execute()
    messages = await (
        db.table("chat_messages")
        .select("id, projects!inner(user_id)", count="exact", head=True)
        .eq("projects.user_id", user_id)
        .eq("role", "user")
        .execute()
    )
    return {"projects": projects.count or 0, "messages": messages.count or 0}


# ---- model settings and API keys ----

async def get_settings(user_id: str) -> dict:
    db = await client()
    res = await db.table("user_settings").select("provider, model, free_generations_used").eq("user_id", user_id).limit(1).execute()
    return res.data[0] if res.data else {"provider": None, "model": None, "free_generations_used": 0}


async def update_settings(user_id: str, provider: str, model: str) -> None:
    db = await client()
    await db.table("user_settings").upsert({"user_id": user_id, "provider": provider, "model": model}, on_conflict="user_id").execute()


async def list_keys(user_id: str) -> list[dict]:
    db = await client()
    res = await db.table("user_api_keys").select("provider, last4, updated_at").eq("user_id", user_id).order("provider").execute()
    return res.data


async def get_encrypted_key(user_id: str, provider: str) -> str | None:
    db = await client()
    res = await db.table("user_api_keys").select("encrypted_key").eq("user_id", user_id).eq("provider", provider).limit(1).execute()
    return res.data[0]["encrypted_key"] if res.data else None


async def upsert_key(user_id: str, provider: str, encrypted_key: str, last4: str) -> None:
    db = await client()
    row = {"user_id": user_id, "provider": provider, "encrypted_key": encrypted_key, "last4": last4}
    await db.table("user_api_keys").upsert(row, on_conflict="user_id,provider").execute()


async def delete_key(user_id: str, provider: str) -> None:
    db = await client()
    await db.table("user_api_keys").delete().eq("user_id", user_id).eq("provider", provider).execute()
