import { Component, effect, ElementRef, inject, untracked, ViewChild } from '@angular/core';
import { GeolocateControl, Map, MapGeoJSONFeature, MapMouseEvent, MapTouchEvent, NavigationControl, Popup } from 'maplibre-gl';
import { ViewerStore } from '../../stores/viewer.store';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-viewer',
  imports: [],
  templateUrl: './viewer.component.html',
  styleUrl: './viewer.component.scss'
})
export class Viewer {
  @ViewChild('map') private mapContainer!: ElementRef<HTMLElement>;
  private map: Map | undefined;
  private viewerStore = inject(ViewerStore)
  
  constructor() {
    effect(() => {
      const tileUrl = this.viewerStore.tileUrl();
      untracked(() => {
        if(!this.map){
          return
        }
        try {
          this.map!.removeLayer(this.tracksMaplibreLayerId);
          this.map!.removeSource(this.tracksMaplibreSourceId);
          this.addTracksToMap(tileUrl);
        }catch(e){
          console.info("Could not reset map", e);
        }
      });
      
    });
  }

  private addClickEventToLayer(layerName: string, action: (event: MapMouseEvent & {
    features?: MapGeoJSONFeature[];
  } & Object) => void) {
    this.map!.on('mouseenter', layerName, () => this.map!.getCanvas().style.cursor = 'pointer');
    this.map!.on('mouseleave', layerName, () => this.map!.getCanvas().style.cursor = '');
    this.map!.on('click', layerName, action);
  }

  private showInfoOnClick(layerName: string) {
    this.addClickEventToLayer(layerName, (e) => {
      const description = JSON.stringify(e.features!.reduce((acc, f, index) => ({ [index]: f.properties, ...acc }), {}), null, 4);
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
      if (hoveredFeatureIds) {
        for (const hoveredFeatureId of hoveredFeatureIds) {
          this.map!.setFeatureState(
            { source, sourceLayer, id: hoveredFeatureId },
            { hover: false }
          );
        }
      }
      hoveredFeatureIds = e.features!.map(f => f.id!);
      for (const feature of e.features!) {
        this.map!.setFeatureState(
          { source, sourceLayer, id: feature.id, },
          { hover: true }
        );
      }

    });
    this.map!.on('mouseleave', layerName, () => {
      if (hoveredFeatureIds) {
        for (const hoveredFeatureId of hoveredFeatureIds) {
          this.map!.setFeatureState(
            { source, sourceLayer, id: hoveredFeatureId },
            { hover: false }
          );
        }
      }
      hoveredFeatureIds = null;
    });
  }

  private tracksMaplibreSourceId = 'track-datas';
  private tracksMaplibreLayerId = 'track-layer';  
  private addTracksToMap(tileUrl: string){
     const tileSourceName = this.viewerStore.tileName(); // TODO support for multiple && support for changes
      this.map!.addSource(this.tracksMaplibreSourceId, {
        type: 'vector',
        url: tileUrl,
        promoteId: 'osm_id',
      });

      
      this.map!.addLayer({
        'id': this.tracksMaplibreLayerId,
        'type': 'line',
        'source': this.tracksMaplibreSourceId,
        'source-layer': tileSourceName,
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': [
            'case',
            ['to-boolean', ['get', 'colour']],
            ['get', 'colour'],
            ['concat',
            'hsl(',
            ["abs", ['%', ['get', 'osm_id'], 360]],
            ',100%, 30%)']
          ],
          'line-width': [
            'case',
            ['boolean', ['feature-state', 'hover'], false],
            10,
            5
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
  }


  ngAfterViewInit() {
    console.log(this.viewerStore.mapBounds);
    const mapBounds = this.viewerStore.mapBounds();
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: environment.mapStyleUrl,
      ...(mapBounds?{bounds: mapBounds}:{}),
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

    this.map.on('load',() => {
      this.addTracksToMap(this.viewerStore.tileUrl());
      this.showInfoOnClick(this.tracksMaplibreLayerId);
      this.addHoverFeatureStateToLayer(this.tracksMaplibreLayerId, this.tracksMaplibreSourceId, this.viewerStore.tileName()) // TODO support for multiple; && Support changes
    });

    this.map.on('move', () => {
      const bounds = this.map!.getBounds();
      const southwest = bounds.getSouthWest();
      const northeast = bounds.getNorthEast();
      this.viewerStore.updateMapBounds([southwest.lng, southwest.lat, northeast.lng, northeast.lat]);
    });
  }

  ngOnDestroy() {
    this.map?.remove();
  }
}
