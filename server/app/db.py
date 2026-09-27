"""Supabase Postgres access. Uses the service role key, so every helper that takes
a user_id enforces ownership itself."""

import re
import secrets
from datetime import UTC, datetime
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

SETTINGS_FIELDS = "provider, model, free_generations_used, free_generations_limit, token_budget, suspended_at, suspended_reason"
_EMPTY_SETTINGS = {
    "provider": None,
    "model": None,
    "free_generations_used": 0,
    "free_generations_limit": None,
    "token_budget": None,
    "suspended_at": None,
    "suspended_reason": "",
}


async def get_settings(user_id: str) -> dict:
    db = await client()
    res = await db.table("user_settings").select(SETTINGS_FIELDS).eq("user_id", user_id).limit(1).execute()
    return res.data[0] if res.data else dict(_EMPTY_SETTINGS)


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


# ---- usage ----

async def record_usage(
    user_id: str,
    project_id: str | None,
    source: str,
    provider: str,
    model: str,
    prompt_tokens: int,
    completion_tokens: int,
    cost: float | None,
) -> None:
    db = await client()
    row = {
        "user_id": user_id,
        "project_id": project_id,
        "source": source,
        "provider": provider,
        "model": model,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "cost": cost,
    }
    await db.table("usage_events").insert(row).execute()


async def platform_tokens_used(user_id: str) -> int:
    db = await client()
    res = await db.rpc("platform_tokens_used", {"p_user": user_id}).execute()
    return int(res.data or 0)


async def get_suspension(user_id: str) -> dict | None:
    """{suspended_at, suspended_reason} if the account is suspended, else None."""
    db = await client()
    res = await (
        db.table("user_settings")
        .select("suspended_at, suspended_reason")
        .eq("user_id", user_id)
        .not_.is_("suspended_at", "null")
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None


# ---- app settings ----

async def get_app_settings() -> dict[str, Any]:
    db = await client()
    res = await db.table("app_settings").select("key, value").execute()
    return {r["key"]: r["value"] for r in res.data}


async def set_app_setting(key: str, value: Any, admin_id: str) -> None:
    db = await client()
    row = {"key": key, "value": value, "updated_by": admin_id, "updated_at": datetime.now(UTC).isoformat()}
    await db.table("app_settings").upsert(row, on_conflict="key").execute()


async def delete_app_setting(key: str) -> None:
    db = await client()
    await db.table("app_settings").delete().eq("key", key).execute()


# ---- admin ----

async def add_audit(admin_id: str, admin_email: str | None, action: str, target_user_id: str | None = None, details: dict | None = None) -> None:
    db = await client()
    row = {
        "admin_id": admin_id,
        "admin_email": admin_email or "",
        "action": action,
        "target_user_id": target_user_id,
        "details": details or {},
    }
    await db.table("admin_audit_log").insert(row).execute()


async def list_audit(limit: int, offset: int) -> tuple[list[dict], int]:
    db = await client()
    res = await (
        db.table("admin_audit_log")
        .select("*", count="exact")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return res.data, res.count or 0


async def admin_list_users(search: str | None, limit: int, offset: int) -> tuple[list[dict], int]:
    db = await client()
    res = await db.rpc("admin_list_users", {"p_search": search or "", "p_limit": limit, "p_offset": offset}).execute()
    rows = res.data or []
    total = rows[0]["total_count"] if rows else 0
    for r in rows:
        r.pop("total_count", None)
    return rows, total


async def admin_stats(days: int) -> dict:
    db = await client()
    res = await db.rpc("admin_stats", {"p_days": days}).execute()
    return res.data


async def admin_get_auth_user(user_id: str) -> dict | None:
    db = await client()
    try:
        res = await db.auth.admin.get_user_by_id(user_id)
    except Exception:
        return None
    u = res.user
    if u is None:
        return None
    return {
        "id": u.id,
        "email": u.email,
        "created_at": u.created_at,
        "last_sign_in_at": u.last_sign_in_at,
        "provider": (u.app_metadata or {}).get("provider"),
        "is_admin": (u.app_metadata or {}).get("role") == "admin",
        "banned_until": getattr(u, "banned_until", None),
        "app_metadata": u.app_metadata or {},
    }


async def admin_list_projects(user_id: str) -> list[dict]:
    db = await client()
    res = await (
        db.table("projects")
        .select("id, name, created_at, updated_at, platform_generation")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .execute()
    )
    return res.data


async def admin_get_project(project_id: str) -> dict | None:
    db = await client()
    res = await db.table("projects").select("*").eq("id", project_id).limit(1).execute()
    return res.data[0] if res.data else None


async def admin_usage_summary(user_id: str) -> dict:
    db = await client()
    res = await db.table("usage_events").select("source, prompt_tokens, completion_tokens, cost").eq("user_id", user_id).execute()
    out = {"platform_tokens": 0, "user_tokens": 0, "platform_cost": 0.0, "calls": len(res.data)}
    for r in res.data:
        tokens = (r["prompt_tokens"] or 0) + (r["completion_tokens"] or 0)
        out[f"{r['source']}_tokens"] += tokens
        if r["source"] == "platform" and r.get("cost") is not None:
            out["platform_cost"] += float(r["cost"])
    return out


async def update_user_settings(user_id: str, fields: dict) -> None:
    """Upsert arbitrary user_settings columns (admin limits, suspension)."""
    db = await client()
    await db.table("user_settings").upsert({"user_id": user_id, **fields}, on_conflict="user_id").execute()


async def admin_update_auth_user(user_id: str, attributes: dict) -> None:
    db = await client()
    await db.auth.admin.update_user_by_id(user_id, attributes)


async def admin_delete_user(user_id: str) -> None:
    db = await client()
    await db.auth.admin.delete_user(user_id)
