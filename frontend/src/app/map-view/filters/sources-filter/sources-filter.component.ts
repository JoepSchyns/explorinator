import { Component, inject } from '@angular/core';
import { ViewerStore } from '../../../stores/viewer.store';
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-sources-filter',
  imports: [MatInputModule, MatSelectModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sources-filter.component.html',
})
export class SourcesFilterComponent {
  private viewerStore = inject(ViewerStore);

  selectedSources = this.viewerStore.filters().sources ?? [];
  readonly allAvailableSources = this.viewerStore.availableSources;
  readonly isLoadingSources = this.viewerStore.isLoadingSources;

  updateFilter(newSources: string[]){
    this.viewerStore.updateSourcesFilter(newSources);
  }
}
