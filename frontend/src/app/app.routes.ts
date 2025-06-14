import { Routes } from '@angular/router';
import { MapViewComponent } from './map-view/map-view.component';
import { RouteViewComponent } from './route-view/route-view.component';
import { ViewerStore } from './stores/viewer.store';

export const routes: Routes = [
    {
        path: '',
        component: MapViewComponent,
        providers: [ViewerStore]
    },
    {
        path: 'route/:id',
        component: RouteViewComponent,
        providers: [ViewerStore]
    }
];
