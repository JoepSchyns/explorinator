from typing import Union, Optional
import os
import asyncpg
from fastapi import FastAPI, HTTPException
from pydantic_settings import BaseSettings
from pydantic import BaseModel, Field

app = FastAPI()

class Settings(BaseSettings):
    db_host: str = "localhost"
    db_port: str = "5432"
    db_user: str = "postgres"
    db_password: str = "password"
    db_name: str = "explorintator"

settings = Settings()

class RouteResponse(BaseModel):
    type: str = Field(..., example="R")
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
    geom: Optional[str] = Field(None, example="0105000020110F0000...")

    class Config:
        populate_by_name = True

@app.get("/route/{route_id}", response_model=RouteResponse, response_model_by_alias=True, summary="Get route by ID", description="Retrieve a route from the database by its unique ID.", response_description="A route object.")
async def get_route(route_id: int):
    """
    Get a route by its ID.
    Returns a route object with all details, or 404 if not found.
    """
    try:
        conn = await asyncpg.connect(
            host=settings.db_host,
            port=settings.db_port,
            user=settings.db_user,
            password=settings.db_password,
            database=settings.db_name
        )
        route = await conn.fetchrow("SELECT * FROM routes WHERE id = $1", route_id)
        await conn.close()
        if route:
            # Map 'from' to 'from_' for Pydantic
            route_dict = dict(route)
            if 'from' in route_dict:
                route_dict['from_'] = route_dict.pop('from')
            return RouteResponse(**route_dict)
        else:
            raise HTTPException(status_code=404, detail="Route not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))