from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class TaskDTO(BaseModel):
    id: int
    complete: bool
    description: str
    position: int


class BranchDTO(BaseModel):
    id: int
    name: str
    url: str


class CommentDTO(BaseModel):
    id: int
    author: str
    created_at: datetime | None
    parent_id: int | None
    text: str | None


class CommitDTO(BaseModel):
    id: int
    message: str
    created_at: datetime | None
    url: str


class PullRequestDTO(BaseModel):
    id: int
    merged: bool
    branch_name: str
    title: str
    review_status: str
    url: str


class StoryDTO(BaseModel):
    id: int
    title: str | None = None
    app_url: str | None = None

    story_type: str | None = None
    estimate: int | None = None
    labels: list[str] = []

    workflow_id: int | None = None
    workflow_state_id: int | None = None
    state_name: str | None = None
    state_type: str | None = None

    updated_at: datetime | None = None
    updated_at_readable: str | None = None


class StoryFullDTO(BaseModel):
    id: int
    title: str
    description: str
    epic: str | None = None
    app_url: str | None = None

    tasks: list[TaskDTO]

    branches: list[BranchDTO]
    comments: list[CommentDTO]
    commits: list[CommitDTO]
    pull_requests: list[PullRequestDTO]

    story_type: str | None = None
    estimate: int | None = None
    labels: list[str] = []

    workflow_id: int | None = None
    workflow_state_id: int | None = None
    state_name: str | None = None
    state_type: str | None = None

    created_at: datetime | None = None
    updated_at: datetime | None = None
    updated_at_readable: str | None = None


class StoryListResponse(BaseModel):
    data: list[StoryDTO]
    next: str | None = None
    total: int | None = None
