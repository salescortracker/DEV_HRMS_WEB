import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-compensation',
  standalone: false,
  templateUrl: './compensation.component.html',
  styleUrl: './compensation.component.css'
})
export class CompensationComponent implements OnInit {

  canViewPayslip: boolean = false;
  canViewHRDashboard: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadCompensationPermissions();

    // if (this.canViewPayslip) {
    //   this.router.navigate(['/compensation/employee-payslip']);
    // }
    // else if (this.canViewHRDashboard) {
    //   this.router.navigate(['/compensation/hr-payslip']);
    // }
  }

  loadCompensationPermissions(): void {

    const menus = JSON.parse(sessionStorage.getItem('Menus') || '[]');

    const payslipMenu = menus.find(
      (m: any) =>
        m.menuName?.trim().toLowerCase() === 'employee payslip'
    );

    const hrMenu = menus.find(
      (m: any) =>
        m.menuName?.trim().toLowerCase() === 'hr payslip dashboard'
    );

    this.canViewPayslip = payslipMenu?.canView ?? false;
    this.canViewHRDashboard = hrMenu?.canView ?? false;

    console.log('Employee Payslip:', this.canViewPayslip);
    console.log('HR Payslip Dashboard:', this.canViewHRDashboard);
  }
}