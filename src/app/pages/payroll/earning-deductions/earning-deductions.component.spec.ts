import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EarningDeductionsComponent } from './earning-deductions.component';

describe('EarningDeductionsComponent', () => {
  let component: EarningDeductionsComponent;
  let fixture: ComponentFixture<EarningDeductionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EarningDeductionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EarningDeductionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
