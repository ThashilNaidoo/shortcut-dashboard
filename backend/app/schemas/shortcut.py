from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

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
    created_at: Optional[datetime]
    parent_id: Optional[int]
    text: Optional[str]

class CommitDTO(BaseModel):
    id: int
    message: str
    created_at: Optional[datetime]
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
    title: str
    app_url: Optional[str] = None

    story_type: Optional[str] = None
    estimate: Optional[int] = None
    labels: List[str] = []

    workflow_id: Optional[int] = None
    workflow_state_id: Optional[int] = None
    state_name: Optional[str] = None
    state_type: Optional[str] = None

    updated_at: Optional[datetime] = None
    updated_at_readable: Optional[str] = None

class StoryFullDTO(BaseModel):
    id: int
    title: str
    description: str
    epic: Optional[str] = None
    app_url: Optional[str] = None

    tasks: List[TaskDTO]

    branches: List[BranchDTO]
    comments: List[CommentDTO]
    commits: List[CommitDTO]
    pull_requests: List[PullRequestDTO]

    story_type: Optional[str] = None
    estimate: Optional[int] = None
    labels: List[str] = []

    workflow_id: Optional[int] = None
    workflow_state_id: Optional[int] = None
    state_name: Optional[str] = None
    state_type: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    updated_at_readable: Optional[str] = None

class StoryListResponse(BaseModel):
    data: List[StoryDTO]
    next: Optional[str] = None
    total: Optional[int] = None