import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveTicketsComponent } from './approve-tickets.component';

describe('ApproveTicketsComponent', () => {
  let component: ApproveTicketsComponent;
  let fixture: ComponentFixture<ApproveTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApproveTicketsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
