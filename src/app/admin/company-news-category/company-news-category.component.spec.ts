import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyNewsCategoryComponent } from './company-news-category.component';

describe('CompanyNewsCategoryComponent', () => {
  let component: CompanyNewsCategoryComponent;
  let fixture: ComponentFixture<CompanyNewsCategoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CompanyNewsCategoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyNewsCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
