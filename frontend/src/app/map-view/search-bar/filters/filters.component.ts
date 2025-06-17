import { Component } from '@angular/core';
import { LoopFilterComponent } from './loop-filter/loop-filter.component';
import { DistanceFilterComponent } from './distance-filter/distance-filter.component';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-filters',
  imports: [LoopFilterComponent, DistanceFilterComponent, MatListModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss'
})
export class FiltersComponent {

}
