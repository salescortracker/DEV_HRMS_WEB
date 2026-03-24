import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterviewLevelComponent } from './interview-level.component';

describe('InterviewLevelComponent', () => {
  let component: InterviewLevelComponent;
  let fixture: ComponentFixture<InterviewLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InterviewLevelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterviewLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
