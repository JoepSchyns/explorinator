1. Get data
Partial from https://download.geofabrik.de/europe/netherlands/overijssel.html
``` bash
wget https://download.geofabrik.de/europe/netherlands/overijssel-latest.osm.pbf
```

2. Filter data
Build docker image
``` bash
docker build -t osmtools docker-osmtools
```

convert to o5m
``` bash
docker run --rm  -it --volume ./data:/osm osmtools osmconvert overijssel-latest.osm.pbf -o=overijssel-latest.o5m
```

filter 
``` bash
docker run --rm -it --volume ./data:/osm osmtools osmfilter overijssel-latest.o5m --keep="route=hiking" -o=overijssel-latest-hiking.osm
```

3. Upload to postgis db
start db 
``` bash
cd ../ && docker compose up db
```
upload
``` bash
docker run --rm -it --volume ./data:/data -e PGPASSWORD=password --network="host" iboates/osm2pgsql:latest -U postgres -d explorintator -H 127.0.0.1 -P 5432 /data/overijssel-latest-hiking.osm
```
