import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { lastValueFrom, map, of } from 'rxjs';

export interface MartinCatalog {
  "tiles": {
    [key: string] : {
      "content_type": string,
      "description": string
    }
  },
  "sprites": {},
  "fonts": {},
  "styles": {}
}

@Injectable({
  providedIn: 'root'
})
export class MartinService {

  private http = inject(HttpClient);

  getTileNames() {
    return this.http.get<MartinCatalog>(environment.marvinBaseUrl + '/catalog').pipe(map((c) => Object.keys(c.tiles)));
  }
}
