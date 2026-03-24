import { TestBed } from '@angular/core/testing';

import { KpiPerformanceService } from './kpi-performance.service';

describe('KpiPerformanceService', () => {
  let service: KpiPerformanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KpiPerformanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
