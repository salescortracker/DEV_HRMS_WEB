import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeResignationDetailsComponent } from './employee-resignation-details.component';

describe('EmployeeResignationDetailsComponent', () => {
  let component: EmployeeResignationDetailsComponent;
  let fixture: ComponentFixture<EmployeeResignationDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeResignationDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeResignationDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
