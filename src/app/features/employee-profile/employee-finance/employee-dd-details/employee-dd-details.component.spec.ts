import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDdDetailsComponent } from './employee-dd-details.component';

describe('EmployeeDdDetailsComponent', () => {
  let component: EmployeeDdDetailsComponent;
  let fixture: ComponentFixture<EmployeeDdDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeDdDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeDdDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
