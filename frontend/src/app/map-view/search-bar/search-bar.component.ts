import { Component, inject, input, output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { SearchFiltersComponent } from './search-filters/search-filters.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-search-bar',
  imports: [MatInputModule, MatFormFieldModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {
  readonly filtersDialog = inject(MatDialog);
  toggleFilters = output();

  openFilters() {
    this.toggleFilters.emit();
    //this.filtersDialog.open(SearchFiltersComponent);
  }

}
