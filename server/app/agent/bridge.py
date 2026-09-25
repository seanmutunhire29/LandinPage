"""Bridge between the server-side agent and the browser-side WebContainer.

When the model calls Bash, we emit a `command` event over the WebSocket and
wait for the frontend to send back a matching `command_result`.
"""

import asyncio
import logging
import uuid
from collections.abc import Awaitable, Callable

log = logging.getLogger(__name__)

Emit = Callable[[dict], Awaitable[None]]

DEFAULT_TIMEOUT = 180  # npm install in a WebContainer can take a while
MAX_OUTPUT = 12_000


class CommandBridge:
    def __init__(self, emit: Emit) -> None:
        self._emit = emit
        self._pending: dict[str, asyncio.Future] = {}
        self._closed = False

    async def run(self, command: str, timeout: float = DEFAULT_TIMEOUT) -> str:
        if self._closed:
            return "Error: the browser is not connected, so commands cannot run right now."
        cmd_id = uuid.uuid4().hex
        fut = asyncio.get_running_loop().create_future()
        self._pending[cmd_id] = fut
        try:
            await self._emit({"type": "command", "id": cmd_id, "command": command})
            result = await asyncio.wait_for(fut, timeout)
        except asyncio.TimeoutError:
            await self._emit({"type": "command_cancel", "id": cmd_id})
            return f"Error: command timed out after {int(timeout)}s: {command}"
        finally:
            self._pending.pop(cmd_id, None)

        output = result.get("output", "")
        if len(output) > MAX_OUTPUT:
            output = "...(truncated)...\n" + output[-MAX_OUTPUT:]
        exit_code = result.get("exit_code")
        if result.get("error"):
            return f"Error: {result['error']}\n{output}".strip()
        return f"exit code {exit_code}\n{output}".strip() if exit_code not in (0, None) else output or "(no output)"

    def resolve(self, cmd_id: str, result: dict) -> None:
        fut = self._pending.get(cmd_id)
        if fut and not fut.done():
            fut.set_result(result)
        else:
            log.warning("command_result for unknown or finished command %s", cmd_id)

    def close(self) -> None:
        self._closed = True
        for fut in self._pending.values():
            if not fut.done():
                fut.set_result({"error": "browser disconnected before the command finished"})
        self._pending.clear()
