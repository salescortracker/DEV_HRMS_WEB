import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecruitmentNoticePeriodComponent } from './recruitment-notice-period.component';

describe('RecruitmentNoticePeriodComponent', () => {
  let component: RecruitmentNoticePeriodComponent;
  let fixture: ComponentFixture<RecruitmentNoticePeriodComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecruitmentNoticePeriodComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecruitmentNoticePeriodComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
