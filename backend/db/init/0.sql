CREATE EXTENSION postgis;

CREATE TABLE routes (
    id BIGINT PRIMARY KEY,
    name TEXT,
    ascent_m REAL,
    descent_m REAL,
    "description" TEXT,
    distance_m REAL,
    color TEXT,
    "from" TEXT,
    osmc_symbol TEXT,
    roundtrip TEXT,
    "to" TEXT,
    website TEXT,
    geom Geometry(MultiLineString, 3857)
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
CREATE OR REPLACE FUNCTION loop_filter(filter text, roundtrip text)
RETURNS boolean AS $loop_filter$
BEGIN
    IF filter = 'BOTH' THEN
        RETURN TRUE;
    ELSIF filter = 'ONLY_LOOPS' THEN
        RETURN roundtrip = 'yes';
    ELSIF filter = 'NO_LOOPS' THEN
        RETURN roundtrip = 'no';
    ELSE
        RETURN TRUE;
    END IF;
END;
$loop_filter$ LANGUAGE plpgsql;

-- expects {'min_m': number, 'max_m': number } or null
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

-- expects string[] or null
CREATE OR REPLACE FUNCTION ids_filter(filter jsonb, id int8)
RETURNS boolean AS $ids_filter$
BEGIN
    IF filter IS NULL THEN
        RETURN TRUE;
    ELSE
        RETURN filter @> to_jsonb(id);
    END IF;
END;
$ids_filter$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.filter_routes(
    z integer, x integer, y integer, query jsonb
) RETURNS bytea AS $$
DECLARE
    mvt bytea;
BEGIN
    RAISE NOTICE 'query value: %', query;
    SELECT INTO mvt ST_AsMVT(tile, 'filter_routes', 4096, 'geom')
    FROM (
        SELECT
            ST_AsMVTGeom(
                ST_Transform(ST_CurveToLine(geom::geometry), 3857),
                ST_TileEnvelope(z, x, y),
                4096, 64, true
            ) AS geom,
            *
        FROM
            public.routes
        WHERE
            z > 7
            AND geom && ST_Transform(ST_TileEnvelope(z, x, y, margin => 0.015625), 3857)
            AND loop_filter(query->'query'->>'loop_filter', roundtrip)
            AND distance_filter(query->'query'->'distance_filter', distance_m::real)
            AND ids_filter(query->'query'->'ids_filter', id)
    ) AS tile;
    RETURN mvt;
END
$$ LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE;


