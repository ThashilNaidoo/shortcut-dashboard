from __future__ import annotations

import asyncio
from datetime import datetime

from app.clients.shortcut_client import ShortcutClient
from app.schemas.shortcut import (
    BranchDTO,
    CommentDTO,
    CommitDTO,
    PullRequestDTO,
    StoryDTO,
    StoryFullDTO,
    StoryListResponse,
    TaskDTO,
)


# ============================================
# Format the date to more readable version
# ============================================
def format_datetime_english(dt: datetime) -> str:
    local_dt = dt.astimezone()
    return local_dt.strftime("%A, %d %B %Y at %H:%M")


# ============================================
# Map the story to the dto for the response
# ============================================
def _map_story_to_dto(s: dict, state_map: dict) -> StoryDTO | None:
    story_id = s.get("id")
    if not isinstance(story_id, int):
        return None

    workflow_state_id = s.get("workflow_state_id")
    wf_state = state_map.get(workflow_state_id) if isinstance(workflow_state_id, int) else None
    state_name = wf_state[0] if wf_state else None
    state_type = wf_state[1] if wf_state else None
    workflow_id_from_map = wf_state[2] if wf_state else None

    label_names: list[str] = []
    for label in s.get("labels") or []:
        if isinstance(label, dict) and isinstance(label.get("name"), str):
            label_names.append(label["name"])

    raw_updated = s.get("updated_at")
    parsed_updated: datetime | None = None
    readable: str | None = None

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
        workflow_id=(s.get("workflow_id") if isinstance(s.get("workflow_id"), int) else workflow_id_from_map),
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
    async def get_stories_for_owner(
        self, *, owner: str, page_size: int = 25, next_path: str | None = None
    ) -> StoryListResponse:
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
        s, state_map = await asyncio.gather(
            self._client.get_story(story_id),
            self._client.get_workflow_state_map(ttl_seconds=300),
        )

        # Workflow state
        workflow_state_id = s.get("workflow_state_id")
        wf_state = state_map.get(workflow_state_id) if isinstance(workflow_state_id, int) else None
        state_name = wf_state[0] if wf_state else None
        state_type = wf_state[1] if wf_state else None
        workflow_id_from_map = wf_state[2] if wf_state else None

        # Epic name
        epic_name: str | None = None
        epic_id = s.get("epic_id")
        if isinstance(epic_id, int):
            try:
                epic_data = await self._client.get_epic(epic_id)
                epic_name = epic_data.get("name") or None
            except Exception:
                pass

        # Labels
        label_names: list[str] = []
        for label in s.get("labels") or []:
            if isinstance(label, dict) and isinstance(label.get("name"), str):
                label_names.append(label["name"])

        # Datetime
        def _parse_dt(raw: object) -> datetime | None:
            if isinstance(raw, str):
                return datetime.fromisoformat(raw.replace("Z", "+00:00"))
            return None

        parsed_updated = _parse_dt(s.get("updated_at"))
        readable = format_datetime_english(parsed_updated) if parsed_updated else None

        # Tasks
        tasks = [
            TaskDTO(
                id=t["id"],
                complete=bool(t.get("complete")),
                description=t.get("description") or "",
                position=t.get("position") or 0,
            )
            for t in (s.get("tasks") or [])
            if isinstance(t, dict) and isinstance(t.get("id"), int)
        ]

        # Branches
        branches = [
            BranchDTO(
                id=b["id"],
                name=b.get("name") or "",
                url=b.get("url") or "",
            )
            for b in (s.get("branches") or [])
            if isinstance(b, dict) and isinstance(b.get("id"), int)
        ]

        # Comments
        comments = [
            CommentDTO(
                id=c["id"],
                author=str(c.get("author_id") or ""),
                created_at=_parse_dt(c.get("created_at")),
                parent_id=c.get("parent_id") if isinstance(c.get("parent_id"), int) else None,
                text=c.get("text") if isinstance(c.get("text"), str) else None,
            )
            for c in (s.get("comments") or [])
            if isinstance(c, dict) and isinstance(c.get("id"), int)
        ]

        # Commits
        commits = [
            CommitDTO(
                id=cm["id"],
                message=cm.get("message") or "",
                created_at=_parse_dt(cm.get("created_at")),
                url=cm.get("url") or "",
            )
            for cm in (s.get("commits") or [])
            if isinstance(cm, dict) and isinstance(cm.get("id"), int)
        ]

        # Pull requests
        pull_requests = [
            PullRequestDTO(
                id=pr["id"],
                merged=bool(pr.get("merged")),
                branch_name=pr.get("branch_name") or "",
                title=pr.get("title") or "",
                review_status=pr.get("review_status") or "",
                url=pr.get("url") or "",
            )
            for pr in (s.get("pull_requests") or [])
            if isinstance(pr, dict) and isinstance(pr.get("id"), int)
        ]

        return StoryFullDTO(
            id=s["id"],
            title=s.get("name") or f"Story {story_id}",
            description=s.get("description") or "",
            epic=epic_name,
            app_url=s.get("app_url") if isinstance(s.get("app_url"), str) else None,
            tasks=tasks,
            branches=branches,
            comments=comments,
            commits=commits,
            pull_requests=pull_requests,
            story_type=s.get("story_type") if isinstance(s.get("story_type"), str) else None,
            estimate=s.get("estimate") if isinstance(s.get("estimate"), int) else None,
            labels=label_names,
            workflow_id=s.get("workflow_id") if isinstance(s.get("workflow_id"), int) else workflow_id_from_map,
            workflow_state_id=workflow_state_id if isinstance(workflow_state_id, int) else None,
            state_name=state_name,
            state_type=state_type,
            created_at=_parse_dt(s.get("created_at")),
            updated_at=parsed_updated,
            updated_at_readable=readable,
        )
