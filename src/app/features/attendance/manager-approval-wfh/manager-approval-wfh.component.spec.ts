import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerApprovalWfhComponent } from './manager-approval-wfh.component';

describe('ManagerApprovalWfhComponent', () => {
  let component: ManagerApprovalWfhComponent;
  let fixture: ComponentFixture<ManagerApprovalWfhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManagerApprovalWfhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManagerApprovalWfhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
