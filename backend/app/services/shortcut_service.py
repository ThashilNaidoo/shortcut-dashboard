from __future__ import annotations

from typing import Optional
from datetime import datetime

from app.clients.shortcut_client import ShortcutClient
from app.schemas.shortcut import StoryDTO, StoryFullDTO, StoryListResponse

# ============================================
# Format the date to more readable version
# ============================================
def format_datetime_english(dt: datetime) -> str:
    local_dt = dt.astimezone()
    return local_dt.strftime("%A, %d %B %Y at %H:%M")

# ============================================
# Map the story to the dto for the response
# ============================================
def _map_story_to_dto(s: dict, state_map: dict) -> Optional[StoryDTO]:
    story_id = s.get("id")
    if not isinstance(story_id, int):
        return None

    workflow_state_id = s.get("workflow_state_id")
    wf_state = state_map.get(workflow_state_id) if isinstance(workflow_state_id, int) else None
    state_name = wf_state[0] if wf_state else None
    state_type = wf_state[1] if wf_state else None
    workflow_id_from_map = wf_state[2] if wf_state else None

    label_names: list[str] = []
    for label in (s.get("labels") or []):
        if isinstance(label, dict) and isinstance(label.get("name"), str):
            label_names.append(label["name"])

    raw_updated = s.get("updated_at")
    parsed_updated: Optional[datetime] = None
    readable: Optional[str] = None

    if isinstance(raw_updated, str):
        parsed_updated = datetime.fromisoformat(raw_updated.replace("Z", "+00:00"))
        readable = format_datetime_english(parsed_updated)
    
    return StoryDTO(
        id=story_id,
        title=(s.get("name") if isinstance(s.get("name"), str) else f"Story {story_id}"),
        app_url=(s.get("app_url") if isinstance(s.get("app_url"), str) else None),
        story_type=(s.get("story_type") if isinstance(s.get("story_type"), str) else None),
        estimate=(s.get("estimate") if isinstance(s.get("estimate"), int) else None),
        labels=label_names,
        workflow_id=(
            s.get("workflow_id") if isinstance(s.get("workflow_id"), int) else workflow_id_from_map
        ),
        workflow_state_id=workflow_state_id if isinstance(workflow_state_id, int) else None,
        state_name=state_name,
        state_type=state_type,
        updated_at=parsed_updated,
        updated_at_readable=readable,
    )

# ============================================
# Shortcut Service
# ============================================
class ShortcutService:
    def __init__(self, client: ShortcutClient) -> None:
        self._client = client

    # ============================================
    # Get list of stories for owner name
    # ============================================
    async def get_stories_for_owner(self,  *, owner: str, page_size: int = 25, next_path: Optional[str] = None) -> StoryListResponse:
        query = f"owner:{owner}"

        payload = await self._client.search_stories(
            query=query,
            page_size=page_size,
            detail="slim",
            next_path=next_path,
        )

        state_map = await self._client.get_workflow_state_map(ttl_seconds=300)

        stories: list[StoryDTO] = []
        for s in payload.get("data", []) or []:
            if not isinstance(s, dict):
                continue
            dto = _map_story_to_dto(s, state_map)
            if dto:
                stories.append(dto)
               
        return StoryListResponse(
            data=stories,
            next=payload.get("next"),
            total=payload.get("total"),
        )
    
    # ============================================
    # Get individual story by story id
    # ============================================
    async def get_story_by_id(self, story_id: int) -> StoryFullDTO:
        s = await self._client.get_story(story_id)
        state_map = await self._client.get_workflow_state_map(ttl_seconds=300)
        dto = _map_story_to_dto(s, state_map)
        if dto is None:
            raise ValueError(f"Story {story_id} could not be mapped")
        return dto