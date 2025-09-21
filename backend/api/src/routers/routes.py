import json
from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends
from ..database import get_db
from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

router = APIRouter(
    prefix="/route",
    tags=["routes"],
    responses={404: {"description": "Not found"}},
)

class RouteResponse(BaseModel):
    id: UUID = Field(..., example=UUID("91744960-1234-5678-9012-345678901234"))
    created_at: Optional[datetime] = Field(..., example="2023-10-01T12:00:00Z")
    source: str = Field(..., example="Wandelnet")
    name: Optional[str] = Field(..., example="Nederlands Kustpad deel 1 - 01")
    rating: Optional[float] = Field(None, example=4.5)
    ascent_m: Optional[float] = Field(None, example=None)
    descent_m: Optional[float] = Field(None, example=None)
    description: Optional[str] = Field(None, example=None)
    distance_m: Optional[float] = Field(None, example=None)
    color: Optional[str] = Field(None, example="blue")
    from_: Optional[str] = Field(None, alias="from", example="Sluis")
    symbol: Optional[str] = Field(None, example=None)
    round_trip: Optional[bool] = Field(None, example=None)
    to: Optional[str] = Field(None, example="Cadzand")
    website: Optional[str] = Field(None, example="https://www.wandelnet.nl/nederlands-kustpad-deel-1")
    elevations: Optional[List[float]] = Field(None, example=[1.0, 2.0, 3.0])
    geom: Dict[str, Any] = Field(None, example={
        "type": "LineString",
        "coordinates": [[4.123, 52.123], [4.124, 52.124]]
    })

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
    