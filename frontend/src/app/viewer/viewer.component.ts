import { AfterViewInit, Component, effect, ElementRef, inject, Input, OnDestroy, output, untracked, ViewChild } from '@angular/core';
import { GeolocateControl, Map, MapGeoJSONFeature, MapMouseEvent, NavigationControl } from 'maplibre-gl';
import { RouteMeta, ViewerStore } from '../stores/viewer.store';
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-viewer',
  imports: [],
  templateUrl: './viewer.component.html',
  styleUrl: './viewer.component.scss'
})
export class ViewerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('map') private mapContainer!: ElementRef<HTMLElement>;
  private map: Map | undefined;
  private viewerStore = inject(ViewerStore);
  routesClickedOutput = output<RouteMeta[]>({ alias: 'routesClicked' });
  @Input() enableClick = true;

  // Constants
  private readonly TRACKS_SOURCE_ID = 'track-datas';
  private readonly TRACKS_LAYER_ID = 'track-layer';
  private readonly SELECTED_TRACKS_LAYER_ID = 'track-layer_selected';
  private readonly CLICK_OFFSET = 5;
  private readonly MAP_PADDING = 20;
  private readonly HOVER_LINE_WIDTH = 10;
  private readonly DEFAULT_LINE_WIDTH = 5;
  private readonly HOVER_LINE_BLUR = 2;
  private readonly DEFAULT_LINE_BLUR = 0;
  private readonly LINE_OPACITY = 0.5;
  private readonly SELECTED_LINE_OPACITY = 1;

  constructor() {
    // Watch for changes in the tile URL and update the map accordingly
    effect(() => {
      const tileUrl = this.viewerStore.tileUrl();
      untracked(() => {
        if (!this.map) {
          return;
        }
        try {
          this.map.removeLayer(this.TRACKS_LAYER_ID);
          this.map.removeLayer(this.SELECTED_TRACKS_LAYER_ID);
          this.map.removeSource(this.TRACKS_SOURCE_ID);
          this.addTracksToMap(tileUrl);
        } catch (error) {
          console.error("Failed to update map tracks:", error);
        }
      });
    });

    // Watch map bounds changes and update the store
    effect(() => {
      const mapBounds = this.viewerStore.preferredMapBounds();
      untracked(() => {
        if (!this.map || !mapBounds) {
          return;
        }
        this.map.fitBounds(mapBounds, {
          padding: this.MAP_PADDING
        }, { pauseUpdate: true });
      });
    });
  }


  /**
   * Configures click interaction for a layer to show route information
   */
  private showInfoOnClick(): void {
    this.map!.on('mouseenter', this.TRACKS_LAYER_ID, () => this.map!.getCanvas().style.cursor = 'pointer');
    this.map!.on('mouseleave', this.TRACKS_LAYER_ID, () => this.map!.getCanvas().style.cursor = '');
    // Instead of clicking directly on the feature (which is hard when it's thin), we check for nearby features
    this.map!.on('click', (e) => {
      const offset = this.CLICK_OFFSET;
      const features = this.map!.queryRenderedFeatures([[e.point.x - offset, e.point.y - offset], [e.point.x + offset, e.point.y + offset]], {
        layers: [this.TRACKS_LAYER_ID]
      });
      if (features.length === 0) {
        return;
      }
      const routes = features.map(f => f.properties) as RouteMeta[];
      this.routesClickedOutput.emit(routes);
      this.map!.setFilter(this.SELECTED_TRACKS_LAYER_ID, ['in', 'id', ...routes.map(f => f.id)]);
    });
  }

  /**
   * Adds hover state management to map features
   */
  private addHoverFeatureStateToLayer(layerName: string, source: string, sourceLayer: string): void {
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
          { source, sourceLayer, id: feature.id },
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

  /**
   * Adds track layers to the map with appropriate styling
   */
  private addTracksToMap(tileUrl: string): void {
    const tileSourceName = this.viewerStore.tileName();
    this.map!.addSource(this.TRACKS_SOURCE_ID, {
      type: 'vector',
      url: tileUrl,
      promoteId: 'id',
    });


    // Add main track layer
    this.map!.addLayer({
      'id': this.TRACKS_LAYER_ID,
      'type': 'line',
      'source': this.TRACKS_SOURCE_ID,
      'source-layer': tileSourceName,
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': this.getLineColorExpression(),
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          this.HOVER_LINE_WIDTH,
          this.DEFAULT_LINE_WIDTH
        ],
        'line-blur': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          this.HOVER_LINE_BLUR,
          this.DEFAULT_LINE_BLUR
        ],
        'line-opacity': this.LINE_OPACITY
      }
    });

    // Add selected track layer
    this.map!.addLayer({
      'id': this.SELECTED_TRACKS_LAYER_ID,
      'type': 'line',
      'source': this.TRACKS_SOURCE_ID,
      'source-layer': tileSourceName,
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': this.getLineColorExpression(),
        'line-width': this.HOVER_LINE_WIDTH,
        'line-blur': this.HOVER_LINE_BLUR,
        'line-opacity': this.SELECTED_LINE_OPACITY
      },
      filter: ['in', 'id', ''] // Initially don't show anything 
    });
  }

  /**
   * Gets the MapLibre expression for line color based on feature properties
   */
  private getLineColorExpression(): any {
    return [
      'case',
      ['to-boolean', ['get', 'color']],
      ['get', 'color'],
      ['concat',
        'hsl(',
        ["abs", ['%', ['get', 'distance_m'], 360]],
        ',100%, 30%)']
    ];
  }


  /**
   * Initializes the map and sets up controls and event listeners
   */
  ngAfterViewInit(): void {
    const mapBounds = this.viewerStore.mapBounds();
    this.map = new Map({
      container: this.mapContainer.nativeElement,
      style: environment.mapStyleUrl,
      ...(mapBounds ? { bounds: mapBounds } : {}),
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

    this.map.on('load', () => {
      this.addTracksToMap(this.viewerStore.tileUrl());
      if (this.enableClick) {
        this.showInfoOnClick();
      }
      this.addHoverFeatureStateToLayer(this.TRACKS_LAYER_ID, this.TRACKS_SOURCE_ID, this.viewerStore.tileName());
    });

    this.map.on('move', () => {
      const bounds = this.map!.getBounds();
      const southwest = bounds.getSouthWest();
      const northeast = bounds.getNorthEast();
      this.viewerStore.updateMapBounds([southwest.lng, southwest.lat, northeast.lng, northeast.lat]);
    });
  }

  /**
   * Cleans up map resources when component is destroyed
   */
  ngOnDestroy(): void {
    this.map?.remove();
  }
}
