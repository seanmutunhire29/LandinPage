from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app import db
from app.agent.template import build_template
from app.auth import User, current_user

router = APIRouter(prefix="/projects", tags=["projects"])


class CreateProject(BaseModel):
    design_spec: dict
    first_message: str = Field(min_length=1, max_length=8000)
    name: str | None = Field(default=None, max_length=120)


def _name_from(message: str) -> str:
    line = " ".join(message.split())
    return line if len(line) <= 60 else line[:57].rstrip() + "..."


@router.get("")
async def list_projects(user: User = Depends(current_user)):
    return await db.list_projects(user.id)


@router.post("", status_code=201)
async def create_project(body: CreateProject, user: User = Depends(current_user)):
    project = await db.create_project(user.id, body.name or _name_from(body.first_message), body.design_spec)
    await db.upsert_files(project["id"], build_template(body.design_spec, project["name"]))
    # The first message is stored as a pending user turn; generation starts when
    # the workspace connects over the WebSocket and asks to resume it.
    await db.add_message(project["id"], "user", body.first_message)
    return project


@router.get("/{project_id}")
async def get_project(project_id: str, user: User = Depends(current_user)):
    project = await db.get_project(project_id, user.id)
    if project is None:
        raise HTTPException(404, "Project not found")
    files = await db.list_files(project_id)
    messages = await db.list_messages(project_id)
    return {"project": project, "files": files, "messages": messages}
