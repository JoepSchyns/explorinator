/**
 * Utility functions for determining route colors
 * All functions return the same color but for different contexts (e.g., MapLibre style expression vs direct color string)
 */
import { ColorSpecification, DataDrivenPropertyValueSpecification } from "maplibre-gl";
import { RouteMeta } from "../stores/viewer.store";

export function getColor(routeMeta: RouteMeta) {
    if(routeMeta.color) {
        return routeMeta.color;
    }
    const hue = Math.abs(routeMeta.distance_m % 360);
    const saturation = 100;
    const lightness = 30;
    return `hsl(${hue},${saturation}%, ${lightness}%)`;
}

export const LINE_COLOR_EXPRESSION: DataDrivenPropertyValueSpecification<ColorSpecification> = [
      'case',
      ['to-boolean', ['get', 'color']],
      ['get', 'color'],
      ['concat',
        'hsl(',
        ["abs", ['%', ['get', 'distance_m'], 360]],
        ',100%, 30%)']
    ]
