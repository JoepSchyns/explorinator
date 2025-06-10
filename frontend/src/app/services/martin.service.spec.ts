import { TestBed } from '@angular/core/testing';

import { MartinService } from './martin.service';

describe('MartinService', () => {
  let service: MartinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MartinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
