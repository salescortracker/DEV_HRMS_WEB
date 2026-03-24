import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmploymentTypeComponent } from './employment-type.component';

describe('EmploymentTypeComponent', () => {
  let component: EmploymentTypeComponent;
  let fixture: ComponentFixture<EmploymentTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmploymentTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmploymentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
