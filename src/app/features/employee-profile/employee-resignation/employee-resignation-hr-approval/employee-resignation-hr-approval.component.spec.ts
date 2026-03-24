import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeResignationHrApprovalComponent } from './employee-resignation-hr-approval.component';

describe('EmployeeResignationHrApprovalComponent', () => {
  let component: EmployeeResignationHrApprovalComponent;
  let fixture: ComponentFixture<EmployeeResignationHrApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeResignationHrApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeResignationHrApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
