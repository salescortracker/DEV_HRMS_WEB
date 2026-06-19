import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-employee-documents',
  standalone: false,
  templateUrl: './employee-documents.component.html',
  styleUrl: './employee-documents.component.css'
})
export class EmployeeDocumentsComponent implements OnInit {

  canViewLetters: boolean = false;
  canViewForms: boolean = false;
  canViewDocuments: boolean = false;
  canViewMyLetters: boolean = false;
  canViewMyForms: boolean = false;

  ngOnInit(): void {
    this.loadTabPermissions();
  }

  loadTabPermissions(): void {

    const menus = JSON.parse(sessionStorage.getItem('Menus') || '[]');

    const letters = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'hr letters'
    );

    const forms = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'forms'
    );

    const documents = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'employee documents'
    );

    const myLetters = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'my letters/forms'
    );

    const myForms = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'my forms'
    );

    this.canViewLetters = letters?.canView ?? false;
    this.canViewForms = forms?.canView ?? false;
    this.canViewDocuments = documents?.canView ?? false;
    this.canViewMyLetters = myLetters?.canView ?? false;
    this.canViewMyForms = myForms?.canView ?? false;
  }
}