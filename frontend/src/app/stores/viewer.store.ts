import { patchState, signalStore, watchState, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { environment } from '../../environments/environment';
import { computed, inject } from '@angular/core';
import { debounce } from '../../utils/debounce';
import { ApiService } from '../services/api/api.service';
import { lastValueFrom } from 'rxjs';

export type RouteMeta = {
    id: string;
    name?: string;
    created_at: Date;
    source: string;
    rating?: number;
    ascent_m?: number;
    descent_m?: number;
    description?: string;
    distance_m: number;
    color?: string;
    from?: string;
    symbol?: string;
    round_trip: boolean;
    to?: string;
    website?: string;
    elevations?: number[];
    geom: GeoJSON.LineString | GeoJSON.MultiLineString ;
}

export const LOOP_FILTER_VALUES = ['ONLY_LOOPS', 'BOTH', 'NO_LOOPS'] as const;
export type LoopFilter = typeof LOOP_FILTER_VALUES[number];

export type DistanceFilter = {
    minMeters: number,
    maxMeters: number
};

export type SourcesFilter = string[] | null; // null means no filtering on sources

export type ViewerState = {
    version: 1,
    mapBounds: [number, number, number, number] | null; // [west, south, east, north]
    preferredMapBounds: [number, number, number, number] | null; // [west, south, east, north]
    availableSources: string[] | null; // null means not loaded yet
    isLoadingSources: boolean;
    filters: {
        loop: LoopFilter,
        distance: DistanceFilter,
        sources: SourcesFilter,
        ids?: number[];
    }
};
export const MAX_DISTANCE_METERS = 80000; // 80 km; 80km means 80+km
const defaultViewerState: ViewerState = {
    version: 1,
    mapBounds: null, // Default bounds covering the whole world
    preferredMapBounds: null,
    availableSources: null,
    isLoadingSources: false,
    filters: {
        loop: 'BOTH',
        distance: {
            minMeters: 0,
            maxMeters: MAX_DISTANCE_METERS
        },
        sources: null,
    }
};

function getLocalStorageKey(){
    return 'viewer-state' + window.location.pathname;
};

function getIntialState() {
    try {

        const storedState = localStorage.getItem(getLocalStorageKey());
        if (storedState) {
            const state = JSON.parse(storedState);
            return { ...defaultViewerState, ...state } as ViewerState; // Merge with default to ensure all properties exist
        }
    } catch (e) {
        console.error('UserStore: Error loading state from localStorage:', e);
    }
    return defaultViewerState;
}
function setStateToLocalStorage(state: ViewerState) {
    try {
        localStorage.setItem(getLocalStorageKey(), JSON.stringify(state));
    } catch (e) {
        console.error('UserStore: Error persisting state to localStorage:', e);
    }
}
const debouncedSetStateToLocalStorage = debounce(setStateToLocalStorage, 1000);

function createQueryJSON(filters: ViewerState['filters']) {
    const query = {
        loop_filter: filters.loop,
        distance_filter: {
            min_m: filters.distance.minMeters,
            max_m: filters.distance.maxMeters
        },
        ids_filter: filters.ids,
        sources_filter: filters.sources,
    };

    return JSON.stringify(query);
}

const tileName = 'filter_routes';
export const ViewerStore = signalStore(
    withState(getIntialState()),
    withComputed((store) => ({
        tileUrl: computed(() => `${environment.martinBaseUrl}/${tileName}?query=${createQueryJSON(store.filters())
            }`),
    })),
    withMethods((store) => {
        const apiService = inject(ApiService);
        return {
            updateFilters(filters: ViewerState['filters']) {
                patchState(store, () => ({ filters }));
            },
            updateLoopFilter(loop: ViewerState['filters']['loop']) {
                patchState(store, () => ({ filters: { ...store.filters(), loop } }));
            },
            updateDistanceFilter(distance: ViewerState['filters']['distance']) {
                patchState(store, () => ({ filters: { ...store.filters(), distance } }));
            },
            updateIdsFilter(ids?: number[]) {
                patchState(store, () => ({ filters: { ...store.filters(), ids } }));
            },
            updateSourcesFilter(sources: SourcesFilter) {
                patchState(store, () => ({ filters: { ...store.filters(), sources } }));
            },
            tileName: () => tileName,
            updateMapBounds(bounds: [number, number, number, number]) {
                patchState(store, () => ({
                    mapBounds: bounds
                }));
            },
            updatePreferredMapBounds(bounds: [number, number, number, number]) {
                patchState(store, () => ({
                    preferredMapBounds: bounds
                }));
            },
            async fetchAvailableSources() {
                if (store.isLoadingSources()) {
                    return; // Already loading
                }
                
                patchState(store, () => ({ isLoadingSources: true }));
                
                try {
                    
                    const sources = await lastValueFrom(apiService.getSources());
                    console.log('ViewerStore: fetchAvailableSources called', sources);
                    if(JSON.stringify(sources) !== JSON.stringify(store.filters().sources)){
                        patchState(store, () => ({
                            availableSources: sources || [],
                            isLoadingSources: false,
                            filters:{ ...store.filters(), sources: sources}
                        }));
                    } else {
                        patchState(store, () => ({
                            isLoadingSources: false,
                        }));
                    }
                } catch (error) {
                    console.error('Failed to fetch available sources:', error);
                    patchState(store, () => ({
                        availableSources: [],
                        isLoadingSources: false
                    }));
                }
            }
        };
    }),
    withHooks({
        onInit(store) {
            store.fetchAvailableSources();

            watchState(store, (state) => {
                debouncedSetStateToLocalStorage(state);
                if (store.availableSources() === null && !store.isLoadingSources()) {
                    store.fetchAvailableSources();
                }
            });
        }
    })
);
