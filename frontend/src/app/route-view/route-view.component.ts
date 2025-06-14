import { Component, effect, inject, input, untracked } from '@angular/core';
import { ViewerComponent } from '../viewer/viewer.component';
import { MatCardModule } from '@angular/material/card';
import { ViewerStore } from '../stores/viewer.store';


@Component({
  selector: 'app-route-view',
  imports: [ViewerComponent, MatCardModule],
  templateUrl: './route-view.component.html',
  styleUrl: './route-view.component.scss',
})
export class RouteViewComponent {
  id = input.required<string>();
  private prevId: string | null = null;

  private viewerStore = inject(ViewerStore);
  constructor() {
    effect(() => {
      const currentId = this.id();
      untracked(() => {
        if(this.prevId === currentId) {
          return;
        }
        this.prevId = currentId;
        this.viewerStore.updateIdsFilter([currentId]);
      });
    });
  }
}
