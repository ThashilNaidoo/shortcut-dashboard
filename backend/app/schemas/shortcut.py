from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel

class ShortcutSearchResponse(BaseModel):
    data: List[Dict[str, Any]]
    next: Optional[str] = None
    total: Optional[int] = None