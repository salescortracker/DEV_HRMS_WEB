import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentsVerificationComponent } from './documents-verification.component';

describe('DocumentsVerificationComponent', () => {
  let component: DocumentsVerificationComponent;
  let fixture: ComponentFixture<DocumentsVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DocumentsVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DocumentsVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
