import { Component, inject } from '@angular/core';
import {MatButtonToggleGroup, MatButtonToggle} from '@angular/material/button-toggle';
import { LOOP_FILTER_VALUES, LoopFilter, ViewerStore } from '../../../stores/viewer.store';


@Component({
  selector: 'app-loop-filter',
  imports: [MatButtonToggleGroup, MatButtonToggle],
  templateUrl: './loop-filter.component.html',
  styleUrl: './loop-filter.component.scss'
})
export class LoopFilterComponent {
  LOOP_FILTER_VALUES = LOOP_FILTER_VALUES;
  viewerStore = inject(ViewerStore);

  updateFilter(newValue: LoopFilter){
    this.viewerStore.updateLoopFilter(newValue);
  }

  loopFilterValueToHumanReadable(value: LoopFilter){
    return value.toLocaleLowerCase().split('_').join(' ');
  }
}
