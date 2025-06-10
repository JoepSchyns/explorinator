import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { GeolocateControl, Map, MapGeoJSONFeature, MapMouseEvent, NavigationControl, Popup } from 'maplibre-gl';
import { MartinService } from '../services/martin.service';
import { lastValueFrom } from 'rxjs';


@Component({
  selector: 'app-viewer',
  imports: [],
  templateUrl: './viewer.html',
  styleUrl: './viewer.scss'
})
export class Viewer {
  @ViewChild('map') private mapContainer!: ElementRef<HTMLElement>;
  private map: Map | undefined;
  private martinService = inject(MartinService);

  private addClickEventToLayer(layerName: string, action: (event: MapMouseEvent & {
    features?: MapGeoJSONFeature[];
  } & Object) => void) {
    this.map!.on('mouseenter', layerName, () => this.map!.getCanvas().style.cursor = 'pointer');
    this.map!.on('mouseleave', layerName, () => this.map!.getCanvas().style.cursor = '');
    this.map!.on('click', layerName, action);
  }

  private showInfoOnClick(layerName: string) {
    this.addClickEventToLayer(layerName, (e) => {
      const description = JSON.stringify(e.features!.reduce((acc, f, index) => ({[index]: f.properties, ...acc}), {}), null, 4);
      new Popup()
        .setLngLat(e.lngLat)
        .setHTML(`<pre>${description}</pre>`)
        .addTo(this.map!);
    });
  }

  private addHoverFeatureStateToLayer(layerName: string, source: string, sourceLayer: string) {
    let hoveredFeatureIds: (string | number)[] | null = null;
    this.map!.on('mouseenter', layerName, (e: MapMouseEvent & {
      features?: MapGeoJSONFeature[];
    } & Object) => {
      if(hoveredFeatureIds){
        for(const hoveredFeatureId of hoveredFeatureIds){
          this.map!.setFeatureState(
            { source, sourceLayer, id: hoveredFeatureId},
            { hover: false }
          );
        }
      }
      hoveredFeatureIds = e.features!.map(f => f.id!);
      for(const feature of e.features!){
        this.map!.setFeatureState(
          { source, sourceLayer, id: feature.id,},
          { hover: true }
        );
      }
      
    });
    this.map!.on('mouseleave', layerName, () => {
      if(hoveredFeatureIds){
        for(const hoveredFeatureId of hoveredFeatureIds){
          this.map!.setFeatureState(
            { source, sourceLayer, id: hoveredFeatureId},
            { hover: false }
          );
        }
      }
      hoveredFeatureIds = null;
    });
  }


  ngAfterViewInit() {
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: `https://api.maptiler.com/maps/bright-v2/style.json?key=WESQN5xwveltgP5t4Kza`,
    });

    this.map.addControl(new NavigationControl({
      visualizePitch: true,
      visualizeRoll: true,
      showZoom: true,
      showCompass: true
    }));

    this.map.addControl(new GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true
    }));

    this.map.on('load', async () => {

      const tileSourceName = 'planet_osm_line';
      const tracksMaplibreSourceId = 'track-datas';
      this.map!.addSource(tracksMaplibreSourceId, {
        type: 'vector',
        url: await lastValueFrom(this.martinService.getTileUrl([tileSourceName])),
        promoteId: 'osm_id',
      });

      const tracksMaplibreLayerId = 'track-layer-' + tileSourceName;
      this.map!.addLayer({
        'id': tracksMaplibreLayerId,
        'type': 'line',
        'source': tracksMaplibreSourceId,
        'source-layer': tileSourceName,
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': [
            'concat',
            'hsl(',
            ["abs", ['%', ['get', 'osm_id'], 360]],
            ',100%, 50%)'
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            10,
            3
          ],
          'line-blur': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            2,
            0
          ],
          'line-opacity': 0.5
        }
      });
      this.showInfoOnClick(tracksMaplibreLayerId);
      this.addHoverFeatureStateToLayer(tracksMaplibreLayerId, tracksMaplibreSourceId, tileSourceName);

    });
  }

  ngOnDestroy() {
    this.map?.remove();
  }
}
