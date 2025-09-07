import { Component, effect, inject, input, untracked } from '@angular/core';
import { ViewerComponent } from '../viewer/viewer.component';
import { MatCardModule } from '@angular/material/card';
import { RouteMeta, ViewerStore } from '../stores/viewer.store';
import { ApiService } from '../services/api/api.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Location } from '@angular/common'
import { GpxService } from '../services/gpx/gpx.service';
import { Feature , Geometry, GeoJsonProperties } from 'geojson';


@Component({
  selector: 'app-route-view',
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, ViewerComponent, MatCardModule],
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

  constructor() {
    effect(() => {
      const currentId = this.id();
      untracked(() => {
        if (this.prevId === currentId) {
          return;
        }
        this.prevId = currentId;
        this.viewerStore.updateIdsFilter([currentId]);
        console.log('RouteViewComponent: updating ids filter to', [currentId]);
        this.apiService.getRoute(currentId).subscribe(routeMeta => {
          this.routeMeta = routeMeta;
          this.viewerStore.updatePreferredMapBounds(routeMeta.geom.bbox?.slice(0, 4) as [number, number, number, number]);
        });
      });
    });
  }
}
