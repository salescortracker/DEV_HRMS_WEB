import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminDemousersComponent } from './super-admin-demousers.component';

describe('SuperAdminDemousersComponent', () => {
  let component: SuperAdminDemousersComponent;
  let fixture: ComponentFixture<SuperAdminDemousersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuperAdminDemousersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperAdminDemousersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
