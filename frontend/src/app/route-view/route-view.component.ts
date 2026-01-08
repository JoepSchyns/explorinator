import { Component, effect, inject, input, untracked } from '@angular/core';
import { ViewerComponent } from '../viewer/viewer.component';
import { MatCardModule } from '@angular/material/card';
import { MAX_DISTANCE_METERS, RouteMeta, ViewerStore } from '../stores/viewer.store';
import { ApiService } from '../services/api/api.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Location, TitleCasePipe } from '@angular/common'
import { GpxService } from '../services/gpx/gpx.service';
import { Feature , Geometry, GeoJsonProperties } from 'geojson';
import { StripHtmlPipe } from "../pipes/strip-html.pipe";


@Component({
  selector: 'app-route-view',
  imports: [TitleCasePipe, MatToolbarModule, MatIconModule, MatButtonModule, ViewerComponent, MatCardModule, StripHtmlPipe],
  templateUrl: './route-view.component.html',
  styleUrl: './route-view.component.scss',
})
export class RouteViewComponent {
  id = input.required<number>();
  private prevId: number | null = null;
  private viewerStore = inject(ViewerStore);
  private apiService = inject(ApiService);
  private location = inject(Location);
  private gpxService = inject(GpxService);

  routeMeta?: RouteMeta;

  back() {
    this.location.back()
  }
  
  getFormattedDistance(): string {
    if (!this.routeMeta?.distance_m) return '0 km';
    const km = this.routeMeta.distance_m / 1000;
    return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
  }

  
  download(){
    const geojson : Feature<Geometry, GeoJsonProperties> = { 
      type: "Feature",
        properties : {
          name : this.routeMeta?.name,
        },
        geometry: this.routeMeta!.geom
    } ;

    this.gpxService.gpxDownload(geojson, {metadata: {
      name: this.routeMeta?.name,
      author: {
        name: 'Explorinator',
        link: {
          href: this.location.path(),
        }
      }
    }});
  }
  // Helper function to calculate bounding box from GeoJSON geometry
  private getBBox(geom: GeoJSON.LineString | GeoJSON.MultiLineString): [number, number, number, number] {
    const coords = geom.type === 'LineString' ? 
      geom.coordinates : 
      geom.coordinates.flat();  
    let minLng = coords[0][0], maxLng = coords[0][0];
    let minLat = coords[0][1], maxLat = coords[0][1];
    coords.forEach(coord => {
      minLng = Math.min(minLng, coord[0]);
      maxLng = Math.max(maxLng, coord[0]);
      minLat = Math.min(minLat, coord[1]);
      maxLat = Math.max(maxLat, coord[1]);
    }
    );
    return [minLng, minLat, maxLng, maxLat];
  }

  constructor() {
    effect(() => {
      const currentId = this.id();
      untracked(() => {
        if (this.prevId === currentId) {
          return;
        }
        this.prevId = currentId;

        // Reset filters to show only the selected route
        this.viewerStore.updateIdsFilter([currentId]);
        this.viewerStore.updateLoopFilter('BOTH');
        this.viewerStore.updateDistanceFilter({ minMeters: 0, maxMeters: MAX_DISTANCE_METERS });
        this.viewerStore.updateSourcesFilter(null);
        
        console.log('RouteViewComponent: updating ids filter to', [currentId]);
        this.apiService.getRoute(currentId).subscribe(routeMeta => {
          this.routeMeta = routeMeta;
          const bbox = this.getBBox(routeMeta.geom);
          this.viewerStore.updatePreferredMapBounds(bbox);
        });
      });
    });
  }
}
