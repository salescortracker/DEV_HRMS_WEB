import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-employee-details',
  standalone: false,
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.css'
})
export class EmployeeDetailsComponent implements OnInit {

  canViewPersonal = false;
  canViewFamily = false;
  canViewEmergency = false;
  canViewReference = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadTabPermissions();
  }

  loadTabPermissions(): void {

    const menus = JSON.parse(sessionStorage.getItem('Menus') || '[]');

    const personal = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'personal details'
    );

    const family = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'family details'
    );

    const emergency = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'emergency contact'
    );

    const reference = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'references'
    );

    this.canViewPersonal = personal?.canView ?? false;
    this.canViewFamily = family?.canView ?? false;
    this.canViewEmergency = emergency?.canView ?? false;
    this.canViewReference = reference?.canView ?? false;

    const currentUrl = this.router.url;

    if (
      currentUrl === '/details' ||
      currentUrl === '/employee'
    ) {
      if (this.canViewPersonal) {
        this.router.navigate(['/employee/personal']);
      } else if (this.canViewFamily) {
        this.router.navigate(['/employee/family']);
      } else if (this.canViewEmergency) {
        this.router.navigate(['/employee/emergency']);
      } else if (this.canViewReference) {
        this.router.navigate(['/employee/reference']);
      }
    }
  }
}
