from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.clients.shortcut_client import ShortcutClient
from app.schemas.shortcut import ShortcutSearchResponse
from app.services.shortcut_service import ShortcutService

router = APIRouter()

def get_shortcut_client() -> ShortcutClient:
    return ShortcutClient()

def get_shortcut_service(
    client: ShortcutClient = Depends(get_shortcut_client)
) -> ShortcutService:
    return ShortcutService(client)

@router.get("/stories", response_model=ShortcutSearchResponse)
async def list_stories_for_user(
    page_size: int = Query(25, ge=1, le=100),
    next: Optional[str] = Query(None, description="User the `next` value returned by the previous call"),
    svc: ShortcutService = Depends(get_shortcut_service),
) -> ShortcutSearchResponse:
    return await svc.get_stories_for_owner(
        owner="thashilnaidoo",
        page_size=page_size,
        next_path=next
    )