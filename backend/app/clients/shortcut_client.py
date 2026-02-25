from __future__ import annotations

from typing import Any, Dict, Optional
import httpx

from app.core.config import settings

class ShortcutClient:
    BASE_URL = "https://api.app.shortcut.com/api/v3"

    def __init__(self) -> None:
        self._headers = {
            "Shortcut-Token": settings.shortcut_api_token,
            "Content-Type": "application/json",
        }

    async def search_stories(
        self,
        *,
        query: str,
        page_size: int = 25,
        detail: str = "slim",
        next_path: Optional[str] = None,
    ) -> Dict[str, Any]:
        url = f"{self.BASE_URL}/search/stories"

        params: Dict[str, Any] = {
            "query": query,
            "page_size": page_size,
            "detail": detail,
        }

        if next_path:
            params["next"] = next_path

        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.get(url, headers=self._headers, params=params)

            r.raise_for_status()
            return r.json()