import { Injectable } from '@angular/core';
import GeoJsonToGpx from "@dwayneparton/geojson-to-gpx"


@Injectable({
  providedIn: 'root'
})
export class GpxService {

  gpxDownload(...args: Parameters<typeof GeoJsonToGpx>) {
    // Will convert geojson into xml document
    const gpx = GeoJsonToGpx(...args);

    // convert document to string or post process it
    const gpxString = new XMLSerializer().serializeToString(gpx);

    // @see https://stackoverflow.com/questions/10654971/create-text-file-from-string-using-js-and-html5
    const link = document.createElement('a');
    link.download = `${args[1]?.metadata?.name}.gpx`;
    const blob = new Blob([gpxString], {type: 'text/xml'});
    link.href = window.URL.createObjectURL(blob);
    link.click();

  }
}


