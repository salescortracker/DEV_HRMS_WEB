import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeSubmissionComponent } from './employee-submission.component';

describe('EmployeeSubmissionComponent', () => {
  let component: EmployeeSubmissionComponent;
  let fixture: ComponentFixture<EmployeeSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeSubmissionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
