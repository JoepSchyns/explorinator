import json
from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends
from ..models.route import RouteResponse
from ..database import get_db

router = APIRouter(
    prefix="/route",
    tags=["routes"],
    responses={404: {"description": "Not found"}},
)

@router.get("/{route_id}", 
           response_model=RouteResponse, 
           response_model_by_alias=True, 
           summary="Get route by ID", 
           description="Retrieve a route from the database by its unique ID.", 
           response_description="A route object.")
async def get_route(route_id: UUID, conn=Depends(get_db)):
    """
    Get a route by its ID.
    Returns a route object with all details, or 404 if not found.
    """
    try:
        route = await conn.fetchrow("""
            SELECT *, ST_AsGeoJSON(ST_transform(geom, 4326)) AS geom_geojson FROM routes WHERE id = $1
        """, route_id)
        if route:
            route_dict = dict(route)
            if 'geom_geojson' in route_dict:
                route_dict['geom'] = json.loads(route_dict.pop('geom_geojson'))
            return RouteResponse(**route_dict)
        else:
            raise HTTPException(status_code=404, detail="Route not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    