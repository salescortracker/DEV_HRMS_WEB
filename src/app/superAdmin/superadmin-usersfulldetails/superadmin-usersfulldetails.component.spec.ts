import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperadminUsersfulldetailsComponent } from './superadmin-usersfulldetails.component';

describe('SuperadminUsersfulldetailsComponent', () => {
  let component: SuperadminUsersfulldetailsComponent;
  let fixture: ComponentFixture<SuperadminUsersfulldetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuperadminUsersfulldetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuperadminUsersfulldetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
