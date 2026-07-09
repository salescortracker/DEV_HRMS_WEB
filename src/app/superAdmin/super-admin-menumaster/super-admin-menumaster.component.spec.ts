import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminMenumasterComponent } from './super-admin-menumaster.component';

describe('SuperAdminMenumasterComponent', () => {
  let component: SuperAdminMenumasterComponent;
  let fixture: ComponentFixture<SuperAdminMenumasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuperAdminMenumasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperAdminMenumasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
