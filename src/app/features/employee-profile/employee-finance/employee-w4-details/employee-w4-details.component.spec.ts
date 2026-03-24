import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeW4DetailsComponent } from './employee-w4-details.component';

describe('EmployeeW4DetailsComponent', () => {
  let component: EmployeeW4DetailsComponent;
  let fixture: ComponentFixture<EmployeeW4DetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeW4DetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeW4DetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
