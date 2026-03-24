import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminTopbarComponent } from './super-admin-topbar.component';

describe('SuperAdminTopbarComponent', () => {
  let component: SuperAdminTopbarComponent;
  let fixture: ComponentFixture<SuperAdminTopbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuperAdminTopbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperAdminTopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
