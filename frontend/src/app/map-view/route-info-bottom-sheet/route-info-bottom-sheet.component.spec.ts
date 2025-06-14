import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouteInfoBottomSheetComponent } from './route-info-bottom-sheet.component';

describe('RouteInfoBottomSheetComponent', () => {
  let component: RouteInfoBottomSheetComponent;
  let fixture: ComponentFixture<RouteInfoBottomSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouteInfoBottomSheetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouteInfoBottomSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
