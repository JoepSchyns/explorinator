import { Component } from '@angular/core';
import { Viewer } from './viewer/viewer.component';
import { SearchBarComponent } from './search-bar/search-bar.component';


@Component({
  selector: 'app-map-view',
  imports: [Viewer, SearchBarComponent],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss'
})
export class MapViewComponent {

}
