from fastapi import APIRouter

from app.api.v1.shortcut_routes import router as shortcut_router

router = APIRouter()
router.include_router(shortcut_router, prefix="/shortcut", tags=["shortcut"])