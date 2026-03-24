import { TestBed } from '@angular/core/testing';

import { MissedPunchService } from './missed-punch.service';

describe('MissedPunchService', () => {
  let service: MissedPunchService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MissedPunchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
