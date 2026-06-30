import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkAuthComponent } from './work-auth.component';

describe('WorkAuthComponent', () => {
  let component: WorkAuthComponent;
  let fixture: ComponentFixture<WorkAuthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkAuthComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkAuthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
