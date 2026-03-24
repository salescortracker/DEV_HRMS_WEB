import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreeningResultComponent } from './screening-result.component';

describe('ScreeningResultComponent', () => {
  let component: ScreeningResultComponent;
  let fixture: ComponentFixture<ScreeningResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScreeningResultComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScreeningResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
