import { TestBed } from '@angular/core/testing';

import { EmployeePayRollService } from './employee-pay-roll.service';

describe('EmployeePayRollService', () => {
  let service: EmployeePayRollService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmployeePayRollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
