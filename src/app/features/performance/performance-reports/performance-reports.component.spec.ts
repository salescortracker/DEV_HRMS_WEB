import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerformanceReportsComponent } from './performance-reports.component';

describe('PerformanceReportsComponent', () => {
  let component: PerformanceReportsComponent;
  let fixture: ComponentFixture<PerformanceReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PerformanceReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerformanceReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
