import { Injectable } from '@angular/core';
import GeoJsonToGpx from "@dwayneparton/geojson-to-gpx";


@Injectable({
  providedIn: 'root'
})
export class GpxService {

  gpxDownload(...[geojson, options, ...rest]: Parameters<typeof GeoJsonToGpx>) {
    const gpx = GeoJsonToGpx(geojson, options, ...rest);
    const gpxString = new XMLSerializer().serializeToString(gpx);
    const link = document.createElement('a');
    link.download = `${options?.metadata?.name}.gpx`;
    const blob = new Blob([gpxString], {type: 'application/gpx+xml'});
    link.href = window.URL.createObjectURL(blob);
    link.click();

  }
}


