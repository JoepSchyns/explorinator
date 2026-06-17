# Database

PostgreSQL + PostGIS. Schema and helper functions are defined in [`init/0.sql`](init/0.sql), which runs automatically on first startup.

`filter_routes(z, x, y, query)` is a [Martin](https://martin.maplibre.org/) tile function that returns a vector tile for the given coordinates. It accepts optional `loop_filter`, `distance_filter`, `ids_filter`, and `sources_filter` parameters via the `query` JSON argument.

## Running

```bash
docker compose up db
```

The database is exposed on host port `5433` for direct access during development:

```bash
psql postgresql://postgres:password@localhost:5433/explorinator
```

