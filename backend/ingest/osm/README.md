0. Start db
Use root composer file to start the db service `docker compose up db`

1. Get data
Partial from https://download.geofabrik.de/europe/netherlands/overijssel.html
``` bash
curl https://download.geofabrik.de/europe/netherlands-latest.osm.pbf -o data/map.osm.pbf
or
curl https://download.geofabrik.de/europe/netherlands/overijssel-latest.osm.pbf -o data/map.osm.pbf
```

2. Filter and upload data
``` bash
docker run --rm -it --volume ${PWD}\data:/data --volume ${PWD}\style:/style -e PGPASSWORD=password --network="host" iboates/osm2pgsql:latest --output=flex --style /style/convert.lua -U postgres -d explorinator -H 127.0.0.1 -P 5432 /data/map.osm.pbf
```
