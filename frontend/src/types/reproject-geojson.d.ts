declare module 'reproject-geojson' {
  interface ReprojectionOptions {
    from: number | string;
    to: number | string;
  }

  function reprojectGeoJSON(geojson: any, options: ReprojectionOptions): any;
  export = reprojectGeoJSON;
}
