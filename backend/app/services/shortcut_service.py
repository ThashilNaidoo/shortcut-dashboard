from __future__ import annotations

from typing import Optional

from app.clients.shortcut_client import ShortcutClient
from app.schemas.shortcut import ShortcutSearchResponse

class ShortcutService:
    def __init__(self, client: ShortcutClient) -> None:
        self._client = client

    async def get_stories_for_owner(
        self, 
        *,
        owner: str,
        page_size: int = 25,
        next_path: Optional[str] = None,
    ) -> ShortcutSearchResponse:
        query = f"owner:{owner} !is:done"
        payload = await self._client.search_stories(
            query=query,
            page_size=page_size,
            detail="slim",
            next_path=next_path,
        )
        return ShortcutSearchResponse(**payload)