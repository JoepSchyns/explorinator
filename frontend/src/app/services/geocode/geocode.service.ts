import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeocodeService {
  private http = inject(HttpClient);

  geocode(query: string) {
    return this.http.get<GeoJSON.FeatureCollection>(`${environment.geocodeBaseUrl}?q=${query}&format=geojson`)
  }
}
