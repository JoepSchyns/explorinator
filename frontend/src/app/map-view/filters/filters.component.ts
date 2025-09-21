import { Component } from '@angular/core';
import { LoopFilterComponent } from './loop-filter/loop-filter.component';
import { DistanceFilterComponent } from './distance-filter/distance-filter.component';
import { MatListModule } from '@angular/material/list';
import { SourcesFilterComponent } from "./sources-filter/sources-filter.component";

@Component({
  selector: 'app-filters',
  imports: [LoopFilterComponent, DistanceFilterComponent, MatListModule, SourcesFilterComponent],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent {

}
