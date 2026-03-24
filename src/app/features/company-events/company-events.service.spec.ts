import { TestBed } from '@angular/core/testing';

import { CompanyEventsService } from './company-events.service';

describe('CompanyEventsService', () => {
  let service: CompanyEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CompanyEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
