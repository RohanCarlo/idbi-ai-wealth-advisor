from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def get_recommendations():
    # Stub — implemented in Phase 3
    return {"recommendations": []}
