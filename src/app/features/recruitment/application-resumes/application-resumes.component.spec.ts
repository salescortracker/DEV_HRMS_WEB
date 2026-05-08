import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationResumesComponent } from './application-resumes.component';

describe('ApplicationResumesComponent', () => {
  let component: ApplicationResumesComponent;
  let fixture: ComponentFixture<ApplicationResumesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationResumesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplicationResumesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
