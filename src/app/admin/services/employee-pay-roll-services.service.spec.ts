import { TestBed } from '@angular/core/testing';

import { EmployeePayRollServicesService } from './employee-pay-roll-services.service';

describe('EmployeePayRollServicesService', () => {
  let service: EmployeePayRollServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeePayRollServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
