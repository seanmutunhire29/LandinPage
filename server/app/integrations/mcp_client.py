"""Generic MCP client. Connects to every server in mcp_servers.json at startup and
exposes their tools to the agent loop as OpenAI-style function tools named
mcp__<server>__<tool>.

Config format (same shape as Claude Desktop's):
    {
      "mcpServers": {
        "fetch":  {"command": "uvx", "args": ["mcp-server-fetch"]},
        "remote": {"url": "https://example.com/mcp"},
        "off":    {"command": "...", "disabled": true}
      }
    }
"""

import json
import logging
import os
import re
from contextlib import AsyncExitStack
from dataclasses import dataclass
from pathlib import Path

from mcp import Client, StdioServerParameters

log = logging.getLogger(__name__)

PREFIX = "mcp__"


@dataclass
class _RemoteTool:
    server: str
    name: str
    schema: dict


def _safe(name: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_-]", "_", name)


class MCPManager:
    def __init__(self) -> None:
        self._stack = AsyncExitStack()
        self._clients: dict[str, Client] = {}
        self._tools: dict[str, _RemoteTool] = {}

    async def start(self, config_path: Path) -> None:
        if not config_path.exists():
            log.info("no MCP config at %s", config_path)
            return
        servers = json.loads(config_path.read_text()).get("mcpServers", {})
        for name, cfg in servers.items():
            if cfg.get("disabled"):
                continue
            try:
                await self._connect(name, cfg)
            except Exception:
                # One broken server must not take the API down.
                log.exception("MCP server %r failed to start", name)

    async def _connect(self, name: str, cfg: dict) -> None:
        if "url" in cfg:
            target = cfg["url"]
        else:
            target = StdioServerParameters(
                command=cfg["command"],
                args=cfg.get("args", []),
                env={**os.environ, **cfg.get("env", {})},
                cwd=cfg.get("cwd"),
            )
        client = await self._stack.enter_async_context(Client(target, read_timeout_seconds=60))
        self._clients[name] = client

        cursor = None
        while True:
            page = await client.list_tools(cursor=cursor)
            for tool in page.tools:
                fn_name = f"{PREFIX}{_safe(name)}__{_safe(tool.name)}"[:64]
                self._tools[fn_name] = _RemoteTool(
                    server=name,
                    name=tool.name,
                    schema={
                        "type": "function",
                        "function": {
                            "name": fn_name,
                            "description": f"[MCP: {name}] {tool.description or tool.name}",
                            "parameters": tool.input_schema or {"type": "object", "properties": {}},
                        },
                    },
                )
            cursor = getattr(page, "next_cursor", None)
            if not cursor:
                break
        log.info("MCP server %r connected with %d tools", name, sum(t.server == name for t in self._tools.values()))

    async def stop(self) -> None:
        await self._stack.aclose()
        self._clients.clear()
        self._tools.clear()

    def tool_schemas(self) -> list[dict]:
        return [t.schema for t in self._tools.values()]

    def handles(self, fn_name: str) -> bool:
        return fn_name in self._tools

    async def call(self, fn_name: str, arguments: dict) -> str:
        tool = self._tools[fn_name]
        result = await self._clients[tool.server].call_tool(tool.name, arguments)
        parts = []
        for block in result.content:
            text = getattr(block, "text", None)
            parts.append(text if text is not None else f"[{getattr(block, 'type', 'content')} omitted]")
        if not parts and result.structured_content is not None:
            parts.append(json.dumps(result.structured_content))
        out = "\n".join(parts) or "(no output)"
        return f"Error from MCP tool: {out}" if result.is_error else out


mcp_manager = MCPManager()
