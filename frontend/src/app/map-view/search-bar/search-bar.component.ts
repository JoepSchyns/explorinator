import { Component, inject, input, output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { GeocodeService } from '../../services/geocode/geocode.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ViewerStore } from '../../stores/viewer.store';


@Component({
  selector: 'app-search-bar',
  imports: [AsyncPipe, MatListModule, MatCardModule, MatInputModule, MatFormFieldModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent {
  readonly filtersDialog = inject(MatDialog);
  private geocodeService = inject(GeocodeService);
  private viewerStore = inject(ViewerStore); 
  public results?: Observable<GeoJSON.FeatureCollection>;
  toggleFilters = output();

  openFilters() {
    console.log('Opening filters dialog');
    this.toggleFilters.emit();
  }

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    
  }

  onEnter(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.results = this.geocodeService.geocode(value);
  }

  onFeatureClick(feature: GeoJSON.Feature) {
    if(!feature.bbox) {
      console.warn('Feature does not have a bounding box:', feature);
      return;
    }
    this.viewerStore.updatePreferredMapBounds(feature.bbox.slice(0, 4) as [number, number, number, number]);
    this.results = undefined; // Clear results after selection
  }

  filterResultFeatures(results: GeoJSON.FeatureCollection | null) {
    if(!results || !results.features) {
      return results;
    }
    const displayNames : string[] = [];
    results.features = results.features.filter((feature: GeoJSON.Feature) => {
      if(displayNames.includes(feature.properties?.['display_name'])) {
        return false;
      }
      displayNames.push(feature.properties?.['display_name']);
      return true;
    });
    return results;
  }
}
