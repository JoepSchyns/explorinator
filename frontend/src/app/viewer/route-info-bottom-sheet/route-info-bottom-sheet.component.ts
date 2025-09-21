import { Component, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { RouteMeta } from '../../stores/viewer.store';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { getColor } from '../routeColor.util';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-route-info-bottom-sheet',
  imports: [MatListModule, RouterModule, MatButtonModule, TitleCasePipe],
  templateUrl: './route-info-bottom-sheet.component.html',
  styleUrl: './route-info-bottom-sheet.component.scss'
})
export class RouteInfoBottomSheetComponent {
  public routeMetas = inject<RouteMeta[]>(MAT_BOTTOM_SHEET_DATA);
  private bottomSheetRef = inject<MatBottomSheetRef<RouteInfoBottomSheetComponent>>(MatBottomSheetRef);
  
  getColor = getColor;

  dismiss(): void {
    this.bottomSheetRef.dismiss();
  }
}
