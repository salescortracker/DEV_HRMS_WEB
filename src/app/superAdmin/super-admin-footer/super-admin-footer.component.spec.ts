import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperAdminFooterComponent } from './super-admin-footer.component';

describe('SuperAdminFooterComponent', () => {
  let component: SuperAdminFooterComponent;
  let fixture: ComponentFixture<SuperAdminFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuperAdminFooterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperAdminFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
