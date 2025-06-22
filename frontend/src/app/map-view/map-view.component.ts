import { Component, inject } from '@angular/core';
import { ViewerComponent } from '../viewer/viewer.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { RouteInfoBottomSheetComponent } from './route-info-bottom-sheet/route-info-bottom-sheet.component';
import { RouteMeta, ViewerStore } from '../stores/viewer.store';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { FiltersComponent } from './filters/filters.component';
import { MatIconModule } from '@angular/material/icon';


@Component({
  imports: [ MatIconModule, MatButtonModule, ViewerComponent, SearchBarComponent, MatBottomSheetModule, MatSidenavModule, FiltersComponent, MatToolbarModule],
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
