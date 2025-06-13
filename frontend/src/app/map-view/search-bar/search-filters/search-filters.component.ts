import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { LoopFilterComponent } from './loop-filter/loop-filter.component';
import { DistanceFilterComponent } from "./distance-filter/distance-filter.component";


@Component({
  selector: 'app-search-filters',
  imports: [MatDialogModule, MatButtonModule, MatListModule, LoopFilterComponent, DistanceFilterComponent, DistanceFilterComponent],
  templateUrl: './search-filters.component.html',
  styleUrl: './search-filters.component.scss',
})
export class SearchFiltersComponent {}
