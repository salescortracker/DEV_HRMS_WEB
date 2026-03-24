import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminSubmenuComponent } from './super-admin-submenu.component';

describe('SuperAdminSubmenuComponent', () => {
  let component: SuperAdminSubmenuComponent;
  let fixture: ComponentFixture<SuperAdminSubmenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuperAdminSubmenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperAdminSubmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
