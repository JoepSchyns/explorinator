BEGIN;

WITH raw AS (
	SELECT
		id::text                AS source_id,
		name,
		ascent_m,
		descent_m,
		description,
		COALESCE(distance_m, ST_Length(geom)) AS distance_m,  -- calculate from geometry if NULL
        ST_StartPoint(ST_LineMerge(geom)) AS "from",
        ST_EndPoint(ST_LineMerge(geom)) AS "to",
		color,
		symbol,
		roundtrip,
		website,
		geom
	FROM routes_osm
	WHERE geom IS NOT NULL  -- ensure we have geometry for distance calculation
)
INSERT INTO public.routes (
	source_id,
	source,
	name,
	ascent_m,
	descent_m,
	description,
	distance_m,
	color,
	"from",
	symbol,
	round_trip,
	"to",
	website,
	geom
)
SELECT
	g.source_id,
	'osm' AS source,
	g.name,
	g.ascent_m,
	g.descent_m,
	g.description,
	g.distance_m,
	g.color,
    g.from,
	g.symbol,
	CASE
		WHEN lower(COALESCE(g.roundtrip, '')) = 'yes' THEN TRUE
		WHEN lower(COALESCE(g.roundtrip, '')) = 'no' THEN FALSE
		WHEN g.from IS NOT NULL AND g.to IS NOT NULL THEN (ST_Distance(g.from, g.to) < 100)  -- consider round trip if start and end are within 100 meters
		ELSE FALSE  -- default to FALSE when we can't determine
	END AS round_trip,
	g.to,
	g.website,
	g.geom
FROM raw g
ON CONFLICT (source, source_id) DO UPDATE SET
	name        = EXCLUDED.name,
	ascent_m    = EXCLUDED.ascent_m,
	descent_m   = EXCLUDED.descent_m,
	description = EXCLUDED.description,
	distance_m  = EXCLUDED.distance_m,
	color       = EXCLUDED.color,
	"from"      = EXCLUDED."from",
	symbol      = EXCLUDED.symbol,
	round_trip  = EXCLUDED.round_trip,
	"to"        = EXCLUDED."to",
	website     = EXCLUDED.website,
	geom        = EXCLUDED.geom;

COMMIT;

DROP TABLE IF EXISTS routes_osm;