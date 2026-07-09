from fastapi import APIRouter

router = APIRouter()


@router.get("/insights")
async def get_insights():
    # Stub — implemented in Phase 2
    return {"insights": []}
