import json
from typing import Union, Optional, Dict, Any
import os
import asyncpg
from fastapi import FastAPI, HTTPException, Depends
from pydantic_settings import BaseSettings
from pydantic import BaseModel, Field
from contextlib import asynccontextmanager

app = FastAPI()

class Settings(BaseSettings):
    db_host: str = "localhost"
    db_port: str = "5432"
    db_user: str = "postgres"
    db_password: str = "password"
    db_name: str = "explorinator"

settings = Settings()

class RouteResponse(BaseModel):
    id: int = Field(..., example=9174496)
    name: str = Field(..., example="Nederlands Kustpad deel 1 - 01")
    ascent_m: Optional[float] = Field(None, example=None)
    descent_m: Optional[float] = Field(None, example=None)
    description: Optional[str] = Field(None, example=None)
    distance_m: Optional[float] = Field(None, example=None)
    color: Optional[str] = Field(None, example="blue")
    from_: Optional[str] = Field(None, alias="from", example="Sluis")
    osmc_symbol: Optional[str] = Field(None, example=None)
    roundtrip: Optional[bool] = Field(None, example=None)
    to: Optional[str] = Field(None, example="Cadzand")
    website: Optional[str] = Field(None, example="https://www.wandelnet.nl/nederlands-kustpad-deel-1")
    geom: Dict[str, Any] = Field(None, example={
        "type": "LineString",
        "coordinates": [[4.123, 52.123], [4.124, 52.124]]
    })

    class Config:
        populate_by_name = True

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db_pool = await asyncpg.create_pool(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        database=settings.db_name
    )
    try:
        yield
    finally:
        await app.state.db_pool.close()

app = FastAPI(lifespan=lifespan)

async def get_db():
    async with app.state.db_pool.acquire() as conn:
        yield conn

@app.get("/route/{route_id}", response_model=RouteResponse, response_model_by_alias=True, summary="Get route by ID", description="Retrieve a route from the database by its unique ID.", response_description="A route object.")
async def get_route(route_id: int, conn=Depends(get_db)):
    """
    Get a route by its ID.
    Returns a route object with all details, or 404 if not found.
    """
    try:
        route = await conn.fetchrow("""
            SELECT *, ST_AsGeoJSON(geom) AS geom_geojson FROM routes WHERE id = $1
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