"""WebSocket channel for a project workspace.

Client -> server
  {"type": "auth", "token": "<supabase access token>"}      must be the first message
  {"type": "chat", "content": "..."}                         new user message, starts a turn
  {"type": "resume"}                                         run a turn on a pending user message
  {"type": "command_result", "id", "exit_code", "output", "error"?}
  {"type": "ping"}

Server -> client
  ready {pending} | user_message {message} | turn_start | token {text}
  assistant_message {message} | tool_start {id,name,args} | tool_result {id,name,ok,summary}
  file_write {path,content} | command {id,command} | command_cancel {id}
  turn_done | error {message} | pong
"""

import asyncio
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app import db
from app.agent.bridge import CommandBridge
from app.agent.loop import AgentContext, history_from_db, run_turn
from app.auth import AuthError, verify_token

log = logging.getLogger(__name__)
router = APIRouter()

# One turn at a time per project, across connections.
_running: set[str] = set()


def _pending(rows: list[dict]) -> bool:
    for row in reversed(rows):
        if row["role"] in ("user", "assistant"):
            return row["role"] == "user"
    return False


@router.websocket("/ws/projects/{project_id}")
async def project_socket(ws: WebSocket, project_id: str):
    await ws.accept()
    send_lock = asyncio.Lock()
    open_ = True

    async def emit(event: dict) -> None:
        nonlocal open_
        if not open_:
            return
        try:
            async with send_lock:
                await ws.send_json(event)
        except Exception:
            open_ = False

    # ---- auth ----
    try:
        first = await asyncio.wait_for(ws.receive_json(), timeout=15)
        if first.get("type") != "auth":
            raise AuthError("first message must be auth")
        user = await verify_token(first.get("token", ""))
    except (AuthError, asyncio.TimeoutError, ValueError) as e:
        await ws.close(code=4401, reason=f"unauthorized: {e}"[:120])
        return

    project = await db.get_project(project_id, user.id)
    if project is None:
        await ws.close(code=4404, reason="project not found")
        return

    bridge = CommandBridge(emit)
    ctx = AgentContext(project_id=project_id, design_spec=project["design_spec"], emit=emit, bridge=bridge)
    turn: asyncio.Task | None = None

    async def run(new_message: str | None) -> None:
        _running.add(project_id)
        try:
            if new_message is not None:
                row = await db.add_message(project_id, "user", new_message)
                await emit({"type": "user_message", "message": row})
            rows = await db.list_messages(project_id)
            await emit({"type": "turn_start"})
            await run_turn(ctx, history_from_db(rows))
            await emit({"type": "turn_done"})
        except Exception as e:
            log.exception("[%s] turn failed", project_id[:8])
            await emit({"type": "error", "message": f"The agent hit an error: {e}"})
            await emit({"type": "turn_done"})
        finally:
            _running.discard(project_id)

    def start(new_message: str | None) -> asyncio.Task | None:
        if project_id in _running:
            asyncio.create_task(emit({"type": "error", "message": "The agent is still working on the previous message."}))
            return turn
        # Reserve before the task first runs so a quick second message can't race in.
        _running.add(project_id)
        return asyncio.create_task(run(new_message))

    await emit({"type": "ready", "pending": _pending(await db.list_messages(project_id))})
    log.info("[%s] socket open for user %s", project_id[:8], user.id[:8])

    try:
        while True:
            msg = await ws.receive_json()
            kind = msg.get("type")
            if kind == "command_result":
                bridge.resolve(msg.get("id", ""), msg)
            elif kind == "chat":
                content = (msg.get("content") or "").strip()
                if content:
                    turn = start(content)
            elif kind == "resume":
                if _pending(await db.list_messages(project_id)):
                    turn = start(None)
            elif kind == "ping":
                await emit({"type": "pong"})
    except WebSocketDisconnect:
        pass
    except Exception:
        log.exception("[%s] socket error", project_id[:8])
    finally:
        open_ = False
        # Pending Bash commands fail fast; a running turn finishes on its own and
        # everything it writes is still persisted.
        bridge.close()
        log.info("[%s] socket closed", project_id[:8])
