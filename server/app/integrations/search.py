"""Web search via DuckDuckGo (ddgs). Free, no API key."""

import asyncio
import logging

from ddgs import DDGS

log = logging.getLogger(__name__)


def _search(query: str, max_results: int) -> list[dict]:
    return DDGS().text(query, max_results=max_results)


async def web_search(query: str, max_results: int = 5) -> str:
    max_results = max(1, min(int(max_results), 10))
    results = await asyncio.wait_for(asyncio.to_thread(_search, query, max_results), timeout=20)
    if not results:
        return f"No results for: {query}"
    lines = []
    for i, r in enumerate(results, 1):
        lines.append(f"{i}. {r.get('title', '').strip()}\n   {r.get('href', '')}\n   {r.get('body', '').strip()}")
    return "\n".join(lines)
