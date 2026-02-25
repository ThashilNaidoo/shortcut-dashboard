from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, Query

from app.clients.shortcut_client import ShortcutClient
from app.schemas.shortcut import TicketListResponse
from app.services.shortcut_service import ShortcutService

router = APIRouter()

def get_shortcut_client() -> ShortcutClient:
    return ShortcutClient()

def get_shortcut_service(client: ShortcutClient = Depends(get_shortcut_client)) -> ShortcutService:
    return ShortcutService(client)

@router.get("/stories", response_model=TicketListResponse)
async def list_stories_for_user(
    owner: str = Query(None),
    page_size: int = Query(25, ge=1, le=200),
    next: Optional[str] = Query(None, description="User the `next` value returned by the previous call"),
    svc: ShortcutService = Depends(get_shortcut_service),
) -> TicketListResponse:
    return await svc.get_stories_for_owner(
        owner=owner,
        page_size=page_size,
        next_path=next
    )