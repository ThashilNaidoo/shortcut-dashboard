from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

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

class StoryListResponse(BaseModel):
    data: List[StoryDTO]
    next: Optional[str] = None
    total: Optional[int] = None