from fastapi import APIRouter, HTTPException, Depends
from ..database import get_db

router = APIRouter(
    prefix="/source",
    tags=["sources"],
    responses={404: {"description": "Not found"}},
)

@router.get("/",
    response_model=list[str],
    summary="List available sources",
    description="Retrieve a list of all available source names.",
    response_description="A list of source names.")
async def list_sources(conn=Depends(get_db)):
    """
    List all available sources.
    Returns a list of source names.
    """
    try:
        sources = await conn.fetch("""
            SELECT DISTINCT source FROM routes
        """)
        return [source["source"] for source in sources]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
