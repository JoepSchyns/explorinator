import { patchState, signalStore, watchState, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { environment } from '../../environments/environment';
import { computed } from '@angular/core';
import { debounce } from '../../utils/debounce';

export type RouteMeta = {
    id: number;
    name?: string;
    ascent_m?: number;
    descent_m?: number;
    description?: string;
    distance_m?: number;
    color?: string;
    from?: string;
    osmc_symbol?: string;
    roundtrip?: 'yes' | 'no';
    to?: string;
    website?: string;
    geom: string; // GeoJSON LineString
}

export const LOOP_FILTER_VALUES = ['ONLY_LOOPS', 'BOTH', 'NO_LOOPS'] as const;
export type LoopFilter = typeof LOOP_FILTER_VALUES[number];

export type DistanceFilter = {
    minMeters: number,
    maxMeters: number
};
export type ViewerState = {
    mapBounds: [number, number, number, number] | null; // [west, south, east, north]
    filters: {
        loop: LoopFilter,
        distance: DistanceFilter
        ids?: number[];
    }
};
export const MAX_DISTANCE_METERS = 80000; // 80 km; 80km means 80+km
const defaultViewerState: ViewerState = {
    mapBounds: null, // Default bounds covering the whole world
    filters: {
        loop: 'BOTH',
        distance: {
            minMeters: 0,
            maxMeters: MAX_DISTANCE_METERS
        }
    }
};

function getLocalStorageKey(){
    return 'viewer-state' + window.location.pathname;
};
function getIntialState() {
    try {

        const storedState = localStorage.getItem(getLocalStorageKey());
        if (storedState) {
            return JSON.parse(storedState) as ViewerState;
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
        ids_filter: filters.ids
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
    withMethods((store) => ({
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
        tileName: () => tileName,
        updateMapBounds(bounds: [number, number, number, number]) {
            patchState(store, () => ({
                mapBounds: bounds
            }));
        }
    })),
    withHooks({
        onInit(store) {
            watchState(store, (state) => {
                debouncedSetStateToLocalStorage(state);
            })
        }
    })
);
