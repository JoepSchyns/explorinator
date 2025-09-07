import { Injectable } from '@angular/core';
import GeoJsonToGpx from "@dwayneparton/geojson-to-gpx";
import reprojectGeoJSON from 'reproject-geojson';



@Injectable({
  providedIn: 'root'
})
export class GpxService {

  gpxDownload(...[geojson3857, options, ...rest]: Parameters<typeof GeoJsonToGpx>) {
    const geojson4326 = reprojectGeoJSON(geojson3857, { from: 3857, to: 4326 }); // convert to WGS84 as required by GPX spec
    const gpx = GeoJsonToGpx(geojson4326, options, ...rest);
    const gpxString = new XMLSerializer().serializeToString(gpx);
    const link = document.createElement('a');
    link.download = `${options?.metadata?.name}.gpx`;
    const blob = new Blob([gpxString], {type: 'text/xml'});
    link.href = window.URL.createObjectURL(blob);
    link.click();

  }
}


