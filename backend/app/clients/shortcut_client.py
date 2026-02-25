from __future__ import annotations

from typing import Any, Dict, Optional, Tuple
import httpx
import asyncio
import time

from app.core.config import settings

class ShortcutClient:
    BASE_URL = "https://api.app.shortcut.com/api/v3"

    def __init__(self) -> None:
        self._headers = {
            "Shortcut-Token": settings.shortcut_api_token,
            "Content-Type": "application/json",
        }
        self._state_map: Optional[Dict[int, Tuple[str, str, Optional[int]]]] = None
        self._state_map_loaded_at: float = 0.0
        self._state_map_lock = asyncio.Lock()

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
        
    async def list_workflows(self) -> list[dict[str, Any]]:
        url = f"{self.BASE_URL}/workflows"
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.get(url, headers=self._headers)
            r.raise_for_status()
            return r.json()
        
    async def get_workflow_state_map(
        self,
        *,
        ttl_seconds: int = 300,
    ) -> Dict[int, Tuple[str, str, Optional[int]]]:
        now = time.time()
        if self._state_map and (now - self._state_map_loaded_at) < ttl_seconds:
            return self._state_map
        
        async with self._state_map_lock:
            now = time.time()
            if self._state_map and (now - self._state_map_loaded_at) < ttl_seconds:
                return self._state_map
            
            workflows = await self.list_workflows()

            state_map: Dict[int, Tuple[str, str, Optional[int]]] = {}
            for wf in workflows:
                wf_id = wf.get("id")
                for st in wf.get("states", []) or []:
                    st_id = st.get("id")
                    st_name = st.get("name")
                    st_type = st.get("type")
                    if isinstance(st_id, int) and isinstance(st_name, str) and isinstance(st_type, str):
                        state_map[st_id] = (st_name, st_type, wf_id if isinstance(wf_id, int) else None)
            
            self._state_map = state_map
            self._state_map_loaded_at = time.time()
            return state_map