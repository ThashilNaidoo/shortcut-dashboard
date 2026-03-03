from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Path, Query

from app.clients.shortcut_client import ShortcutClient
from app.schemas.shortcut import StoryFullDTO, StoryListResponse
from app.services.shortcut_service import ShortcutService

router = APIRouter()


def get_shortcut_client() -> ShortcutClient:
    return ShortcutClient()


def get_shortcut_service(client: ShortcutClient = Depends(get_shortcut_client)) -> ShortcutService:
    return ShortcutService(client)


@router.get("/stories", response_model=StoryListResponse)
async def list_stories_for_user(
    owner: str = Query(None),
    page_size: int = Query(25, ge=1, le=200),
    next: str | None = Query(None, description="User the `next` value returned by the previous call"),
    svc: ShortcutService = Depends(get_shortcut_service),
) -> StoryListResponse:
    return await svc.get_stories_for_owner(owner=owner, page_size=page_size, next_path=next)


@router.get("/stories/{story_id}", response_model=StoryFullDTO)
async def get_story(
    story_id: int = Path(..., ge=1),
    svc: ShortcutService = Depends(get_shortcut_service),
) -> StoryFullDTO:
    try:
        return await svc.get_story_by_id(story_id)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
