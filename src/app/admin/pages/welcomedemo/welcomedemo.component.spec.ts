import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WelcomedemoComponent } from './welcomedemo.component';

describe('WelcomedemoComponent', () => {
  let component: WelcomedemoComponent;
  let fixture: ComponentFixture<WelcomedemoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WelcomedemoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WelcomedemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
