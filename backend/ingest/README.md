1. Get data
Partial from https://download.geofabrik.de/europe/netherlands/overijssel.html
``` bash
curl https://download.geofabrik.de/europe/netherlands-latest.osm.pbf -o data/map.osm.pbf
```

2. Filter and upload data
``` bash
docker run --rm -it --volume ./data:/data --volume ./style:/style -e PGPASSWORD=password --network="host" iboates/osm2pgsql:latest --output=flex --style /style/convert.lua -U postgres -d explorinator -H 127.0.0.1 -P 5432 /data/map.osm.pbf
```
