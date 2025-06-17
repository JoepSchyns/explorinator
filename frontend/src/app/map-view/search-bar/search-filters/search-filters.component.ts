import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { FiltersComponent } from '../filters/filters.component';


@Component({
  selector: 'app-search-filters',
  imports: [MatDialogModule, MatButtonModule, FiltersComponent],
  templateUrl: './search-filters.component.html',
  styleUrl: './search-filters.component.scss',
})
export class SearchFiltersComponent {}
