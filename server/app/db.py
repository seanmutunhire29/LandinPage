"""Supabase Postgres access. Uses the service role key, so every helper that takes
a user_id enforces ownership itself."""

from typing import Any

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
        .select("id, name, created_at, updated_at")
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
