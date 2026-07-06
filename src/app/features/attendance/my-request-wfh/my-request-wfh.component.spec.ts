import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyRequestWfhComponent } from './my-request-wfh.component';

describe('MyRequestWfhComponent', () => {
  let component: MyRequestWfhComponent;
  let fixture: ComponentFixture<MyRequestWfhComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyRequestWfhComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyRequestWfhComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
