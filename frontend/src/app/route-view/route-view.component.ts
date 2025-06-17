import { Component, effect, inject, input, untracked } from '@angular/core';
import { ViewerComponent } from '../viewer/viewer.component';
import { MatCardModule } from '@angular/material/card';
import { RouteMeta, ViewerStore } from '../stores/viewer.store';
import { ApiService } from '../services/api/api.service';


@Component({
  selector: 'app-route-view',
  imports: [ViewerComponent, MatCardModule],
  templateUrl: './route-view.component.html',
  styleUrl: './route-view.component.scss',
})
export class RouteViewComponent {
  id = input.required<number>();
  private prevId: number | null = null;
  private viewerStore = inject(ViewerStore);
  private apiService = inject(ApiService);

 routeMeta? : RouteMeta;;

  constructor() {
    effect(() => {
      const currentId = this.id();
      untracked(() => {
        if(this.prevId === currentId) {
          return;
        }
        this.prevId = currentId;
        this.viewerStore.updateIdsFilter([currentId]);
        this.apiService.getRoute(currentId).subscribe(routeMeta=> {
          this.routeMeta = routeMeta;
        });
      });
    });
  }
}
