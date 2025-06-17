import { Component, inject, input } from '@angular/core';
import {MatSliderModule} from '@angular/material/slider';
import { FormsModule } from '@angular/forms';
import { MAX_DISTANCE_METERS, ViewerStore } from '../../../../stores/viewer.store';

@Component({
  selector: 'app-distance-filter',
  imports: [MatSliderModule, FormsModule],
  templateUrl: './distance-filter.component.html',
  styleUrl: './distance-filter.component.scss'
})
export class DistanceFilterComponent {
  public maxDistanceKilometers = MAX_DISTANCE_METERS / 1000;
  viewerStore = inject(ViewerStore);

  public minKilometers = this.viewerStore.filters().distance.minMeters / 1000;
  public maxKilometers = this.viewerStore.filters().distance.maxMeters / 1000;

  update_filter(){
    this.viewerStore.updateDistanceFilter({
      minMeters: this.minKilometers * 1000,
      maxMeters: this.maxKilometers * 1000
    });
  }
}
