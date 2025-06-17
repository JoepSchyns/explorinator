import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoopFilterComponent } from './loop-filter.component';

describe('LoopFilterComponent', () => {
  let component: LoopFilterComponent;
  let fixture: ComponentFixture<LoopFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoopFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoopFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
