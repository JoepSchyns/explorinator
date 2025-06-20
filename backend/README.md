## Martin
filter based on set name
``` sql
-- expects boolean or null
CREATE OR REPLACE FUNCTION loop_filter(filter text, roundtrip text) RETURNS boolean AS $loop_filter$
BEGIN
  IF filter = 'BOTH' THEN
    RETURN TRUE;
  ELSEIF filter = 'ONLY_LOOPS' THEN
    RETURN roundtrip = 'yes';
  ELSEIF filter = 'NO_LOOPS' THEN
    RETURN roundtrip = 'no';
  ELSE
    RETURN TRUE;
  END IF;
END;
$loop_filter$ language plpgsql;

-- expects {'min_m': number, 'max_m': number } or  null
CREATE OR REPLACE FUNCTION distance_filter(filter jsonb, distance_m real) RETURNS boolean AS $distance_filter$
BEGIN
  IF filter IS NULL THEN
    RETURN TRUE;
  ELSEIF (filter->>'max_m')::real >= 80000 THEN
	RETURN distance_m >= (filter->>'min_m')::real;
  ELSE
    RETURN distance_m >= (filter->>'min_m')::real AND distance_m <= (filter->>'max_m')::real;
  END IF;
END;
$distance_filter$ language plpgsql;

-- expects string[] or  null
CREATE OR REPLACE FUNCTION ids_filter(filter jsonb, id int8) RETURNS boolean AS $ids_filter$
BEGIN
  IF filter IS NULL THEN
    RETURN TRUE;
  ELSE
    RETURN filter @> to_jsonb(id);
  END IF;
END;
$ids_filter$ language plpgsql;


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
	        ST_Transform(ST_CurveToLine("geom"::geometry), 3857),
	        ST_TileEnvelope(z, x , y),
	        4096, 64, true
	    ) AS geom
	    , *
	  FROM
	    "public"."routes"
	  WHERE
		z > 7
	    AND "geom" && ST_Transform(ST_TileEnvelope(z ,x ,y, margin => 0.015625), 3857)
        AND loop_filter(query->'query'->>'loop_filter', roundtrip)
		AND distance_filter(query->'query'->'distance_filter', distance_m::real)
    AND ids_filter(query->'query'->'ids_filter', id)
	) AS tile;
  RETURN mvt;
END
$$ LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE;
````

Bases on debug log of planet_osm_line
``` sql
CREATE OR REPLACE FUNCTION public.filter_lines(
    z integer, x integer, y integer
) RETURNS bytea AS $$
DECLARE
  mvt bytea;
BEGIN
  SELECT INTO mvt ST_AsMVT(tile, 'filter_lines11', 4096, 'geom')
    FROM (
      SELECT
        ST_AsMVTGeom(
            ST_Transform(ST_CurveToLine("way"::geometry), 3857),
            ST_TileEnvelope(z, x, y),
            4096, 64, true
        ) AS geom
        , "access", "addr:housename", "addr:housenumber", "addr:interpolation", "admin_level", "aerialway", "aeroway", "amenity", "area", "barrier", "bicycle", "boundary", "brand", "bridge", "building", "construction", "covered", "culvert", "cutting", "denomination", "disused", "embankment", "foot", "generator:source", "harbour", "highway", "historic", "horse", "intermittent", "junction", "landuse", "layer", "leisure", "lock", "man_made", "military", "motorcar", "name", "natural", "office", "oneway", "operator", "osm_id", "place", "population", "power", "power_source", "public_transport", "railway", "ref", "religion", "route", "service", "shop", "sport", "surface", "toll", "tourism", "tower:type", "tracktype", "tunnel", "water", "waterway", "way_area", "wetland", "width", "wood", "z_order"
      FROM
        "public"."planet_osm_line"
      WHERE
        "way" && ST_Transform(ST_TileEnvelope(z, x, y, margin => 0.015625), 3857)
      
    ) AS tile;

  RETURN mvt;
END
$$ LANGUAGE plpgsql IMMUTABLE STRICT PARALLEL SAFE;
```

```sql
    /******************************************************************************
    ### TileBBox ###

    Given a Web Mercator tile ID as (z, x, y), returns a bounding-box
    geometry of the area covered by that tile.

    __Parameters:__

    - `integer` z - A tile zoom level.
    - `integer` x - A tile x-position.
    - `integer` y - A tile y-position.
    - `integer` srid - SRID of the desired target projection of the bounding
    box. Defaults to 3857 (Web Mercator).

    __Returns:__ `geometry(polygon)`
    ******************************************************************************/
    create or replace function tilebbox (z int, x int, y int, srid int = 3857)
        returns geometry
        language plpgsql immutable as
    $func$
    declare
        max numeric := 20037508.34;
        res numeric := (max*2)/(2^z);
        bbox geometry;
    begin
        bbox := ST_MakeEnvelope(
            -max + (x * res),
            max - (y * res),
            -max + (x * res) + res,
            max - (y * res) - res,
            3857
        );
        if srid = 3857 then
            return bbox;
        else
            return ST_Transform(bbox, srid);
        end if;
    end;
$func$;
```