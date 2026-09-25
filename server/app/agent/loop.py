"""Agent loop. Grew out of the original single-shot CLI (server/main.py): same
OpenRouter client pattern, same Read/Write/Bash tool structure, now an async
function run once per chat turn on top of the project's stored conversation.

- Write/Edit persist to project_files and stream a file_write event to the browser.
- Bash does not run on the server; it is bridged to the user's WebContainer.
- Every tool call in a response gets its own tool response message.
"""

import json
import logging
import time
import uuid
from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from pathlib import PurePosixPath

from openai import APIConnectionError, APIStatusError, AsyncOpenAI

from app import config, db
from app.agent.bridge import CommandBridge
from app.agent.prompts import build_system_prompt
from app.integrations.mcp_client import mcp_manager
from app.integrations.search import web_search

log = logging.getLogger(__name__)

API_KEY = config.OPENROUTER_API_KEY
BASE_URL = config.OPENROUTER_BASE_URL

MAX_ITERATIONS = 30        # model round-trips per turn
MAX_READ_CHARS = 60_000    # cap on what a single Read returns to the model
MAX_STORED_TOOL_OUTPUT = 4_000

Emit = Callable[[dict], Awaitable[None]]


@dataclass
class AgentContext:
    project_id: str
    design_spec: dict
    emit: Emit
    bridge: CommandBridge


_client: AsyncOpenAI | None = None


def get_client() -> AsyncOpenAI:
    global _client
    if _client is None:
        if not API_KEY:
            raise RuntimeError("OPENROUTER_API_KEY is not set")
        _client = AsyncOpenAI(api_key=API_KEY, base_url=BASE_URL)
    return _client


# ---------------------------------------------------------------------------
# Tools
# ---------------------------------------------------------------------------

available_tools = [
    {
        "type": "function",
        "function": {
            "name": "Read",
            "description": "Read the current content of a file in the project",
            "parameters": {
                "type": "object",
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "path to the file, relative to the project root (e.g. src/App.jsx)",
                    }
                },
                "required": ["file_path"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "Write",
            "description": "Create a file or replace its entire content. Prefer Edit for changes to existing files.",
            "parameters": {
                "type": "object",
                "required": ["file_path", "content"],
                "properties": {
                    "file_path": {
                        "type": "string",
                        "description": "path to the file, relative to the project root",
                    },
                    "content": {"type": "string", "description": "the full content to write to the file"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "Edit",
            "description": (
                "Make a targeted change to an existing file by replacing an exact string. "
                "old_string must match the file exactly (including whitespace) and be unique "
                "unless replace_all is true. Read the file first."
            ),
            "parameters": {
                "type": "object",
                "required": ["file_path", "old_string", "new_string"],
                "properties": {
                    "file_path": {"type": "string", "description": "path to the file, relative to the project root"},
                    "old_string": {"type": "string", "description": "exact text to replace"},
                    "new_string": {"type": "string", "description": "replacement text"},
                    "replace_all": {"type": "boolean", "description": "replace every occurrence (default false)"},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "Bash",
            "description": (
                "Run a shell command in the project's WebContainer (browser-based Node.js runtime) "
                "from the project root, e.g. `npm install <pkg>` or `npx vite build`. Returns the output."
            ),
            "parameters": {
                "type": "object",
                "required": ["command"],
                "properties": {"command": {"type": "string", "description": "the command to execute"}},
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "WebSearch",
            "description": "Search the web (DuckDuckGo). Use for current information or library/API docs.",
            "parameters": {
                "type": "object",
                "required": ["query"],
                "properties": {
                    "query": {"type": "string", "description": "the search query"},
                    "max_results": {"type": "integer", "description": "number of results, 1-10 (default 5)"},
                },
            },
        },
    },
]


class ToolError(Exception):
    """An expected failure reported back to the model as the tool result."""


def normalize_path(file_path) -> str:
    if not isinstance(file_path, str) or not file_path.strip():
        raise ToolError("file_path is required")
    p = file_path.strip().replace("\\", "/")
    while p.startswith("./"):
        p = p[2:]
    parts = PurePosixPath(p.lstrip("/")).parts
    if not parts or ".." in parts:
        raise ToolError(f"invalid path: {file_path}")
    if parts[0] in ("node_modules", ".git"):
        raise ToolError(f"cannot modify {parts[0]}/")
    return "/".join(parts)


async def _read(ctx: AgentContext, args: dict) -> str:
    path = normalize_path(args.get("file_path"))
    row = await db.get_file(ctx.project_id, path)
    if row is None:
        paths = [f["file_path"] for f in await db.list_files(ctx.project_id)]
        raise ToolError(f"file not found: {path}. Existing files: {', '.join(paths) or '(none)'}")
    content = row["content"]
    if len(content) > MAX_READ_CHARS:
        return content[:MAX_READ_CHARS] + f"\n...(truncated, {len(content)} chars total)"
    return content


async def _save(ctx: AgentContext, path: str, content: str) -> None:
    await db.upsert_file(ctx.project_id, path, content)
    await ctx.emit({"type": "file_write", "path": path, "content": content})


async def _write(ctx: AgentContext, args: dict) -> str:
    path = normalize_path(args.get("file_path"))
    content = args.get("content")
    if content is None:
        raise ToolError("content is required")
    await _save(ctx, path, str(content))
    return f"Successfully wrote {path} ({len(str(content))} chars)"


async def _edit(ctx: AgentContext, args: dict) -> str:
    path = normalize_path(args.get("file_path"))
    old, new = args.get("old_string"), args.get("new_string")
    if not isinstance(old, str) or not isinstance(new, str) or old == "":
        raise ToolError("old_string (non-empty) and new_string are required")
    row = await db.get_file(ctx.project_id, path)
    if row is None:
        raise ToolError(f"file not found: {path}. Use Write to create it.")
    content = row["content"]
    count = content.count(old)
    if count == 0:
        raise ToolError(f"old_string not found in {path}. Read the file and copy the text exactly.")
    if count > 1 and not args.get("replace_all"):
        raise ToolError(f"old_string appears {count} times in {path}. Add surrounding context to make it unique, or set replace_all.")
    updated = content.replace(old, new) if args.get("replace_all") else content.replace(old, new, 1)
    await _save(ctx, path, updated)
    return f"Edited {path} ({count if args.get('replace_all') else 1} replacement(s))"


async def _bash(ctx: AgentContext, args: dict) -> str:
    command = args.get("command")
    if not isinstance(command, str) or not command.strip():
        raise ToolError("command is required")
    return await ctx.bridge.run(command.strip())


async def _web_search(ctx: AgentContext, args: dict) -> str:
    query = args.get("query")
    if not isinstance(query, str) or not query.strip():
        raise ToolError("query is required")
    return await web_search(query.strip(), args.get("max_results", 5))


TOOL_HANDLERS = {"Read": _read, "Write": _write, "Edit": _edit, "Bash": _bash, "WebSearch": _web_search}


def _preview(value, limit: int = 160) -> str:
    s = value if isinstance(value, str) else json.dumps(value)
    s = " ".join(s.split())
    return s if len(s) <= limit else s[:limit] + "..."


def _log_args(name: str, args: dict) -> dict:
    # Keep file contents out of logs and client events.
    if name == "Write":
        return {"file_path": args.get("file_path"), "content": f"<{len(str(args.get('content', '')))} chars>"}
    if name == "Edit":
        return {"file_path": args.get("file_path"), "replace_all": bool(args.get("replace_all"))}
    return args


async def tool_call(ctx: AgentContext, tool_calls: list[dict]) -> list[dict]:
    """Run every tool call from one model response, in order, and return one
    tool message per call. Failures become error strings, never exceptions."""
    results = []
    for tool in tool_calls:
        name = tool["function"]["name"]
        started = time.monotonic()
        ok = True
        args: dict = {}
        try:
            args = json.loads(tool["function"].get("arguments") or "{}")
            if not isinstance(args, dict):
                raise ToolError("arguments must be a JSON object")
            await ctx.emit({"type": "tool_start", "id": tool["id"], "name": name, "args": _log_args(name, args)})
            if name in TOOL_HANDLERS:
                output = await TOOL_HANDLERS[name](ctx, args)
            elif mcp_manager.handles(name):
                output = await mcp_manager.call(name, args)
            else:
                raise ToolError(f"unknown tool: {name}")
        except json.JSONDecodeError:
            ok, output = False, "Error: invalid JSON in tool arguments"
        except ToolError as e:
            ok, output = False, f"Error: {e}"
        except Exception as e:
            log.exception("[%s] tool %s crashed", ctx.project_id[:8], name)
            ok, output = False, f"Error: {type(e).__name__}: {e}"

        elapsed = time.monotonic() - started
        log.info(
            "[%s] tool %s args=%s ok=%s %.2fs -> %s",
            ctx.project_id[:8], name, _preview(_log_args(name, args)), ok, elapsed, _preview(output),
        )
        await ctx.emit({"type": "tool_result", "id": tool["id"], "name": name, "ok": ok, "summary": _preview(output, 300)})
        results.append({"role": "tool", "tool_call_id": tool["id"], "content": output})
    return results


# ---------------------------------------------------------------------------
# Model call
# ---------------------------------------------------------------------------

async def llm_call(client: AsyncOpenAI, msg: list[dict], tools: list[dict], on_token: Emit) -> dict:
    """Streaming chat completion. Emits text tokens as they arrive and returns
    the assembled assistant message (content + all tool calls)."""
    stream = await client.chat.completions.create(
        model=config.AGENT_MODEL,
        messages=msg,
        tools=tools,
        max_tokens=config.AGENT_MAX_TOKENS,
        stream=True,
    )
    content: list[str] = []
    calls: dict[int, dict] = {}
    async for chunk in stream:
        if not chunk.choices:
            continue
        delta = chunk.choices[0].delta
        if delta.content:
            content.append(delta.content)
            await on_token({"type": "token", "text": delta.content})
        for tc in delta.tool_calls or []:
            idx = tc.index if tc.index is not None else len(calls)
            slot = calls.setdefault(idx, {"id": None, "type": "function", "function": {"name": "", "arguments": ""}})
            if tc.id:
                slot["id"] = tc.id
            if tc.function:
                if tc.function.name and not slot["function"]["name"]:
                    slot["function"]["name"] = tc.function.name
                if tc.function.arguments:
                    slot["function"]["arguments"] += tc.function.arguments

    message: dict = {"role": "assistant"}
    text = "".join(content)
    if text:
        message["content"] = text
    if calls:
        tool_calls = [calls[i] for i in sorted(calls)]
        for tc in tool_calls:
            tc["id"] = tc["id"] or f"call_{uuid.uuid4().hex[:12]}"
        message["tool_calls"] = tool_calls
    if "content" not in message and "tool_calls" not in message:
        message["content"] = ""
    return message


def describe_error(e: Exception) -> str:
    """Short, user-facing description of a failed turn. Full details go to the log."""
    if isinstance(e, APIStatusError):
        if e.status_code == 402:
            return (
                "The model provider declined the request: the OpenRouter key doesn't have enough credit "
                "for it. Add credits or raise the key's limit, or lower AGENT_MAX_TOKENS in server/.env."
            )
        if e.status_code == 401:
            return "The model provider rejected the API key. Check OPENROUTER_API_KEY in server/.env."
        if e.status_code == 429:
            return "The model provider is rate limiting requests. Wait a moment and send your message again."
        return f"The model provider returned an error ({e.status_code}). Try sending your message again."
    if isinstance(e, APIConnectionError):
        return "Couldn't reach the model provider. Check the server's network connection and try again."
    return f"Something went wrong on our side ({type(e).__name__}). Try sending your message again."


# ---------------------------------------------------------------------------
# Conversation
# ---------------------------------------------------------------------------

def history_from_db(rows: list[dict]) -> list[dict]:
    """Model context from stored chat_messages: user and assistant text only.
    Tool traffic from earlier turns is dropped (the agent re-reads files it
    needs), which keeps context small and avoids dangling tool-call pairs.
    Consecutive same-role messages are merged."""
    history: list[dict] = []
    for row in rows:
        if row["role"] not in ("user", "assistant") or not (row.get("content") or "").strip():
            continue
        if history and history[-1]["role"] == row["role"]:
            history[-1]["content"] += "\n\n" + row["content"]
        else:
            history.append({"role": row["role"], "content": row["content"]})
    return history


async def run_turn(ctx: AgentContext, history: list[dict]) -> str:
    """Run one chat turn. `history` is the prior conversation in OpenAI format,
    ending with the (already persisted) user message for this turn. New
    assistant and tool messages are persisted as they happen. Returns the
    final assistant text."""
    client = get_client()
    files = await db.list_files(ctx.project_id)
    messages = [{"role": "system", "content": build_system_prompt(ctx.design_spec, [f["file_path"] for f in files])}]
    messages += history
    tools = available_tools + mcp_manager.tool_schemas()

    for iteration in range(1, MAX_ITERATIONS + 1):
        log.info("[%s] iteration %d", ctx.project_id[:8], iteration)
        message = await llm_call(client, messages, tools, ctx.emit)
        messages.append(message)

        row = await db.add_message(ctx.project_id, "assistant", message.get("content", ""), tool_calls=message.get("tool_calls"))
        await ctx.emit({"type": "assistant_message", "message": row})

        if not message.get("tool_calls"):
            return message.get("content", "")

        for result in await tool_call(ctx, message["tool_calls"]):
            messages.append(result)
            stored = result["content"]
            if len(stored) > MAX_STORED_TOOL_OUTPUT:
                stored = stored[:MAX_STORED_TOOL_OUTPUT] + "\n...(truncated)"
            await db.add_message(ctx.project_id, "tool", stored, tool_call_id=result["tool_call_id"])

    note = f"I stopped after {MAX_ITERATIONS} steps without finishing. Send another message and I'll continue from here."
    log.warning("[%s] hit iteration cap", ctx.project_id[:8])
    row = await db.add_message(ctx.project_id, "assistant", note)
    await ctx.emit({"type": "assistant_message", "message": row})
    return note
