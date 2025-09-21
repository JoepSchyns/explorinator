from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field


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

    class Config:
        populate_by_name = True