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
    this.gpxService.gpxDownload(this.routeMeta!.geom, {metadata: {
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
        this.apiService.getRoute(currentId).subscribe(routeMeta => {
          this.routeMeta = routeMeta;
        });
      });
    });
  }
}
