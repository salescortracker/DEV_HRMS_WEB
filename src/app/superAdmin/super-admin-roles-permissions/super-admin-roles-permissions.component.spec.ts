import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminRolesPermissionsComponent } from './super-admin-roles-permissions.component';

describe('SuperAdminRolesPermissionsComponent', () => {
  let component: SuperAdminRolesPermissionsComponent;
  let fixture: ComponentFixture<SuperAdminRolesPermissionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuperAdminRolesPermissionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperAdminRolesPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
