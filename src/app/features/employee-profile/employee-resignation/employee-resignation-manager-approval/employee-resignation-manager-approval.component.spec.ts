import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeResignationManagerApprovalComponent } from './employee-resignation-manager-approval.component';

describe('EmployeeResignationManagerApprovalComponent', () => {
  let component: EmployeeResignationManagerApprovalComponent;
  let fixture: ComponentFixture<EmployeeResignationManagerApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeResignationManagerApprovalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeResignationManagerApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
