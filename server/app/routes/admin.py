"""Admin dashboard API. Every route requires an admin (app_metadata.role ==
"admin"), and every change is written to admin_audit_log."""

import logging
from datetime import UTC, datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from app import config, db, settings
from app.agent.prompts import SYSTEM_PROMPT
from app.auth import User, require_admin

log = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])

PAGE_SIZE = 25


async def _audit(admin: User, action: str, target: str | None = None, **details) -> None:
    try:
        await db.add_audit(admin.id, admin.email, action, target, details)
    except Exception:
        log.exception("could not write audit entry for %s", action)


async def _with_effective_limits(row: dict) -> dict:
    row["free_generations_limit_effective"] = await settings.effective_free_limit(row)
    row["token_budget_effective"] = await settings.effective_token_budget(row)
    return row


# ---- users ----

@router.get("/users")
async def list_users(search: str = "", page: int = Query(1, ge=1)):
    rows, total = await db.admin_list_users(search.strip(), PAGE_SIZE, (page - 1) * PAGE_SIZE)
    return {
        "users": [await _with_effective_limits(r) for r in rows],
        "total": total,
        "page": page,
        "page_size": PAGE_SIZE,
    }


async def _auth_user(user_id: str) -> dict:
    auth_user = await db.admin_get_auth_user(user_id)
    if auth_user is None:
        raise HTTPException(404, "User not found")
    return auth_user


@router.get("/users/{user_id}")
async def get_user(user_id: str):
    auth_user = await _auth_user(user_id)
    user_settings = await db.get_settings(user_id)
    return {
        "user": auth_user,
        "profile": await db.get_profile(user_id),
        "settings": await _with_effective_limits(dict(user_settings)),
        "usage": await db.admin_usage_summary(user_id),
        "projects": await db.admin_list_projects(user_id),
        "keys": await db.list_keys(user_id),
    }


class LimitsUpdate(BaseModel):
    free_generations_limit: int | None = Field(default=None, ge=0, le=10_000)
    token_budget: int | None = Field(default=None, ge=0)
    reset_free_generations: bool = False


@router.patch("/users/{user_id}")
async def update_user(user_id: str, body: LimitsUpdate, admin: User = Depends(require_admin)):
    await _auth_user(user_id)
    # Fields sent as null clear the override (back to the global setting); omitted fields are untouched.
    fields = {k: getattr(body, k) for k in ("free_generations_limit", "token_budget") if k in body.model_fields_set}
    if body.reset_free_generations:
        fields["free_generations_used"] = 0
    if fields:
        await db.update_user_settings(user_id, fields)
        await _audit(admin, "user.limits", user_id, **fields)
    return await get_user(user_id)


class SuspendBody(BaseModel):
    reason: str = Field(default="", max_length=200)


@router.post("/users/{user_id}/suspend")
async def suspend_user(user_id: str, body: SuspendBody, admin: User = Depends(require_admin)):
    if user_id == admin.id:
        raise HTTPException(400, "You can't suspend yourself.")
    auth_user = await _auth_user(user_id)
    if auth_user["is_admin"]:
        raise HTTPException(400, "Remove admin access before suspending this user.")
    await db.update_user_settings(user_id, {"suspended_at": datetime.now(UTC).isoformat(), "suspended_reason": body.reason.strip()})
    # The flag blocks the API right away; the ban stops sign-in and token refresh.
    await db.admin_update_auth_user(user_id, {"ban_duration": "876000h"})
    await _audit(admin, "user.suspend", user_id, email=auth_user["email"], reason=body.reason.strip())
    return await get_user(user_id)


@router.post("/users/{user_id}/unsuspend")
async def unsuspend_user(user_id: str, admin: User = Depends(require_admin)):
    auth_user = await _auth_user(user_id)
    await db.update_user_settings(user_id, {"suspended_at": None, "suspended_reason": ""})
    await db.admin_update_auth_user(user_id, {"ban_duration": "none"})
    await _audit(admin, "user.unsuspend", user_id, email=auth_user["email"])
    return await get_user(user_id)


class RoleBody(BaseModel):
    admin: bool


@router.post("/users/{user_id}/role")
async def set_role(user_id: str, body: RoleBody, admin: User = Depends(require_admin)):
    if user_id == admin.id and not body.admin:
        raise HTTPException(400, "You can't remove your own admin access.")
    auth_user = await _auth_user(user_id)
    app_metadata = {**auth_user["app_metadata"], "role": "admin" if body.admin else None}
    await db.admin_update_auth_user(user_id, {"app_metadata": app_metadata})
    await _audit(admin, "user.promote" if body.admin else "user.demote", user_id, email=auth_user["email"])
    return await get_user(user_id)


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(user_id: str, admin: User = Depends(require_admin)):
    if user_id == admin.id:
        raise HTTPException(400, "You can't delete your own account here.")
    auth_user = await _auth_user(user_id)
    if auth_user["is_admin"]:
        raise HTTPException(400, "Remove admin access before deleting this user.")
    await db.admin_delete_user(user_id)
    await _audit(admin, "user.delete", user_id, email=auth_user["email"])


# ---- projects ----

@router.get("/projects/{project_id}")
async def get_project(project_id: str):
    project = await db.admin_get_project(project_id)
    if project is None:
        raise HTTPException(404, "Project not found")
    owner = await db.admin_get_auth_user(project["user_id"])
    return {
        "project": project,
        "owner": {"id": project["user_id"], "email": owner["email"] if owner else None},
        "files": await db.list_files(project_id),
        "messages": await db.list_messages(project_id),
    }


# ---- analytics ----

@router.get("/stats")
async def stats(days: int = Query(30, ge=7, le=365)):
    return await db.admin_stats(days)


# ---- platform settings ----

class PlatformUpdate(BaseModel):
    platform_model: str | None = Field(default=None, min_length=1, max_length=200)
    free_generations: int | None = Field(default=None, ge=0, le=10_000)
    default_token_budget: int | None = Field(default=None, ge=0)
    max_tokens: int | None = Field(default=None, ge=256, le=200_000)
    platform_enabled: bool | None = None


async def _platform_payload() -> dict:
    current = await settings.get_all()
    return {
        "values": {k: current[k] for k in settings.PLATFORM_KEYS},
        "defaults": {k: settings.DEFAULTS[k] for k in settings.PLATFORM_KEYS},
        "platform_key_configured": bool(config.OPENROUTER_API_KEY),
    }


@router.get("/settings")
async def get_platform_settings():
    return await _platform_payload()


@router.put("/settings")
async def update_platform_settings(body: PlatformUpdate, admin: User = Depends(require_admin)):
    current = await settings.get_all()
    changes = {}
    for key, value in body.model_dump(exclude_none=True).items():
        if value != current[key]:
            changes[key] = {"from": current[key], "to": value}
            await settings.save(key, value, admin.id)
    if changes:
        await _audit(admin, "settings.update", None, **changes)
    return await _platform_payload()


# ---- system prompt ----

class PromptBody(BaseModel):
    prompt: str = Field(min_length=20, max_length=50_000)


async def _prompt_payload() -> dict:
    custom = await settings.get("system_prompt")
    return {"prompt": custom or SYSTEM_PROMPT, "default": SYSTEM_PROMPT, "customized": bool(custom)}


@router.get("/system-prompt")
async def get_system_prompt():
    return await _prompt_payload()


@router.put("/system-prompt")
async def update_system_prompt(body: PromptBody, admin: User = Depends(require_admin)):
    previous = await settings.get("system_prompt") or SYSTEM_PROMPT
    if body.prompt.strip() == SYSTEM_PROMPT.strip():
        await settings.reset("system_prompt")
    else:
        await settings.save("system_prompt", body.prompt, admin.id)
    # The previous text is kept so the audit log doubles as prompt history.
    await _audit(admin, "system_prompt.update", None, previous=previous, new=body.prompt)
    return await _prompt_payload()


@router.delete("/system-prompt")
async def reset_system_prompt(admin: User = Depends(require_admin)):
    previous = await settings.get("system_prompt")
    await settings.reset("system_prompt")
    if previous:
        await _audit(admin, "system_prompt.reset", None, previous=previous)
    return await _prompt_payload()


# ---- announcement ----

class Announcement(BaseModel):
    enabled: bool
    message: str = Field(default="", max_length=500)
    level: Literal["info", "warning", "success"] = "info"


@router.get("/announcement")
async def get_announcement():
    return await settings.get("announcement")


@router.put("/announcement")
async def update_announcement(body: Announcement, admin: User = Depends(require_admin)):
    value = {**body.model_dump(), "message": body.message.strip()}
    await settings.save("announcement", value, admin.id)
    await _audit(admin, "announcement.update", None, **value)
    return value


# ---- audit log ----

@router.get("/audit")
async def audit_log(page: int = Query(1, ge=1)):
    rows, total = await db.list_audit(PAGE_SIZE, (page - 1) * PAGE_SIZE)
    return {"entries": rows, "total": total, "page": page, "page_size": PAGE_SIZE}
