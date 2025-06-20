import { TestBed } from '@angular/core/testing';

import { ToGpxService } from './gpx.service';

describe('ToGpxService', () => {
  let service: ToGpxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToGpxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
