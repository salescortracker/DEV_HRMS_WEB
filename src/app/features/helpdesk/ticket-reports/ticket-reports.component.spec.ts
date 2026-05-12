import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketReportsComponent } from './ticket-reports.component';

describe('TicketReportsComponent', () => {
  let component: TicketReportsComponent;
  let fixture: ComponentFixture<TicketReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TicketReportsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TicketReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
