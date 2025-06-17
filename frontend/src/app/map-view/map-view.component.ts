import { Component, inject } from '@angular/core';
import { ViewerComponent } from '../viewer/viewer.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { RouteInfoBottomSheetComponent } from './route-info-bottom-sheet/route-info-bottom-sheet.component';
import { RouteMeta, ViewerStore } from '../stores/viewer.store';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FiltersComponent } from './search-bar/filters/filters.component';


@Component({
  imports: [ViewerComponent, SearchBarComponent, MatBottomSheetModule, MatSidenavModule, FiltersComponent],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss',
})
export class MapViewComponent {
  private bottomSheet = inject(MatBottomSheet);
  public viewerStore = inject(ViewerStore);

  openRoutesBottomSheet(routeMetas: RouteMeta[]) {
    this.bottomSheet.open(RouteInfoBottomSheetComponent, {
      data: routeMetas
    });
  }

  constructor() {
    this.viewerStore.updateIdsFilter();
  }
}
