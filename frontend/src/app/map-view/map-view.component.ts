import { Component, inject } from '@angular/core';
import { ViewerComponent } from '../viewer/viewer.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { ViewerStore } from '../stores/viewer.store';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
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
  public viewerStore = inject(ViewerStore);

  constructor() {
    this.viewerStore.updateIdsFilter();
  }
}
