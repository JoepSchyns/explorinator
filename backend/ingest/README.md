1. Get data
Partial from https://download.geofabrik.de/europe/netherlands/overijssel.html
``` bash
curl https://download.geofabrik.de/europe/netherlands-latest.osm.pbf -o data/map.osm.pbf
```

2. Filter data
Build docker image
``` bash
docker build -t osmtools docker-osmtools
```

convert to o5m
``` bash
docker run --rm  -it --volume ./data:/osm osmtools osmconvert map.osm.pbf -o=map.o5m
```

filter 
``` bash
docker run --rm -it --volume ./data:/osm osmtools osmfilter map.o5m --keep="type=route and route=hiking" -o=map-hiking.osm
```

3. Upload to postgis db
start db 
``` bash
cd ../ && docker compose up db
```
upload
``` bash
docker run --rm -it --volume ./data:/data --volume ./style:/style -e PGPASSWORD=password --network="host" iboates/osm2pgsql:latest --output=flex --style /style/convert.lua -U postgres -d explorinator -H 127.0.0.1 -P 5432 /data/map-hiking.osm
```
