import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyMissedPunchComponent } from './my-missed-punch.component';

describe('MyMissedPunchComponent', () => {
  let component: MyMissedPunchComponent;
  let fixture: ComponentFixture<MyMissedPunchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyMissedPunchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyMissedPunchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
