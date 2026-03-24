import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResignationmasterComponent } from './resignationmaster.component';

describe('ResignationmasterComponent', () => {
  let component: ResignationmasterComponent;
  let fixture: ComponentFixture<ResignationmasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResignationmasterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResignationmasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
