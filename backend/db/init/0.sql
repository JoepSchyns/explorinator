CREATE EXTENSION postgis;

CREATE TABLE routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id TEXT NOT NULL,
    UNIQUE(source, source_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    source TEXT NOT NULL,
    name TEXT,
    rating DECIMAL(2,1) CHECK (rating >= 0 AND rating <= 5),
    ascent_m REAL,
    descent_m REAL,
    "description" TEXT,
    distance_m REAL NOT NULL,
    color TEXT,
    "from" Geometry(Point, 3857),
    symbol TEXT,
    round_trip BOOLEAN NOT NULL,
    "to" Geometry(Point, 3857),
    website TEXT,
    elevations REAL[],
    geom Geometry(Geometry, 3857) NOT NULL CHECK (ST_GeometryType(geom) IN ('ST_LineString', 'ST_MultiLineString'))
);

/******************************************************************************
### TileBBox ###

Given a Web Mercator tile ID as (z, x, y), returns a bounding-box
geometry of the area covered by that tile.

__Parameters:__
- `integer` z - A tile zoom level.
- `integer` x - A tile x-position.
- `integer` y - A tile y-position.
- `integer` srid - SRID of the desired target projection of the bounding box. Defaults to 3857 (Web Mercator).

__Returns:__ `geometry(polygon)`
******************************************************************************/
CREATE OR REPLACE FUNCTION tilebbox(z int, x int, y int, srid int = 3857)
RETURNS geometry
LANGUAGE plpgsql IMMUTABLE AS
$func$
DECLARE
    max numeric := 20037508.34;
    res numeric := (max*2)/(2^z);
    bbox geometry;
BEGIN
    bbox := ST_MakeEnvelope(
        -max + (x * res),
        max - (y * res),
        -max + (x * res) + res,
        max - (y * res) - res,
        3857
    );
    IF srid = 3857 THEN
        RETURN bbox;
    ELSE
        RETURN ST_Transform(bbox, srid);
    END IF;
END;
$func$;

-- expects boolean or null
CREATE OR REPLACE FUNCTION public.loop_filter(filter text, round_trip boolean)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN CASE
        WHEN filter IS NULL OR filter = 'BOTH' THEN TRUE
        WHEN round_trip AND filter = 'ONLY_LOOPS' THEN TRUE
        WHEN NOT round_trip AND filter = 'NO_LOOPS' THEN TRUE
        ELSE FALSE
    END;
END;
$function$
;

-- expects {'min_m': number, 'max_m': number } or null (where max_m of 80000 or higher means "no upper limit")
CREATE OR REPLACE FUNCTION distance_filter(filter jsonb, distance_m real)
RETURNS boolean AS $distance_filter$
BEGIN
    IF filter IS NULL THEN
        RETURN TRUE;
    ELSIF (filter->>'max_m')::real >= 80000 THEN
        RETURN distance_m >= (filter->>'min_m')::real;
    ELSE
        RETURN distance_m >= (filter->>'min_m')::real AND distance_m <= (filter->>'max_m')::real;
    END IF;
END;
$distance_filter$ LANGUAGE plpgsql;

-- expects UUID[] or null
CREATE OR REPLACE FUNCTION ids_filter(filter jsonb, id UUID)
RETURNS boolean AS $ids_filter$
BEGIN
    IF filter IS NULL THEN
        RETURN TRUE;
    ELSE
        RETURN filter @> to_jsonb(id);
    END IF;
END;
$ids_filter$ LANGUAGE plpgsql;

-- expects string[] or null
CREATE OR REPLACE FUNCTION sources_filter(filter jsonb, source TEXT)
RETURNS boolean AS $sources_filter$
BEGIN
    IF filter IS NULL THEN
        RETURN TRUE;
    ELSE
        RETURN filter @> to_jsonb(source);
    END IF;
END;
$sources_filter$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.filter_routes(z integer, x integer, y integer, query jsonb)
 RETURNS bytea
 LANGUAGE plpgsql
 IMMUTABLE PARALLEL SAFE STRICT
AS $function$
DECLARE
    mvt bytea;
BEGIN
    SELECT INTO mvt ST_AsMVT(tile, 'filter_routes', 4096, 'geom')
    FROM (
        SELECT
            ST_AsMVTGeom(
                ST_Simplify(ST_LineMerge(geom::geometry),GREATEST(20, 2000 + (-1980.0/11.0) * z)),
                ST_TileEnvelope(z, x, y),
                4096, 64, true
            ) AS geom,
            *
        FROM
            public.routes
        WHERE
            geom && ST_TileEnvelope(z, x, y, margin => 0.015625)
            AND loop_filter(query->'query'->>'loop_filter', round_trip)
            AND distance_filter(query->'query'->'distance_filter', distance_m::real)
            AND ids_filter(query->'query'->'ids_filter', id)
            AND sources_filter(query->'query'->'sources_filter', source)
    ) AS tile;
    RETURN mvt;
END
$function$
;



