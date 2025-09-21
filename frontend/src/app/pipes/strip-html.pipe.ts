import { Pipe, PipeTransform } from '@angular/core';
/*
 * Strips HTM
 * Takes an input parameter HTML.
 * Usage:
 *   content | striphtml
 * Example:
 *   <p [innerHTML]="content | striphtml"></p>
*/
@Pipe({
    name: 'striphtml'
})
export class StripHtmlPipe implements PipeTransform {
    transform(value: any): any {
        if ((value === null) || (value === '')) {
            return '';
        } else {
            return value.replace(/<(?:.|\n)*?>/gm, ' ');
        }
    }
}
