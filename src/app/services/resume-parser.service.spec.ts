import { TestBed } from '@angular/core/testing';

import { ResumeParserService } from './resume-parser.service';

describe('ResumeParserService', () => {
  let service: ResumeParserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResumeParserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
