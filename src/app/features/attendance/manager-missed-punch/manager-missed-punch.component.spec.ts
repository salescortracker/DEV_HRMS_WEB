import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerMissedPunchComponent } from './manager-missed-punch.component';

describe('ManagerMissedPunchComponent', () => {
  let component: ManagerMissedPunchComponent;
  let fixture: ComponentFixture<ManagerMissedPunchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManagerMissedPunchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerMissedPunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
