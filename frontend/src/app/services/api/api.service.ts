import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { RouteMeta } from '../../stores/viewer.store';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  getRoute(id: number) {
    return this.http.get<RouteMeta>(`${environment.apiBaseUrl}/route/${id}`);
  }
}
