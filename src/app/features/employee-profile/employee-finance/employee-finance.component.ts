import { Component } from '@angular/core';
import { EmployeeW4DetailsComponent } from './employee-w4-details/employee-w4-details.component';
import { EmployeeBankDetailsComponent } from './employee-bank-details/employee-bank-details.component';
import { EmployeeDdDetailsComponent } from './employee-dd-details/employee-dd-details.component';
import { Router, Routes } from '@angular/router';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-employee-finance',
  standalone: false,
  templateUrl: './employee-finance.component.html',
  styleUrl: './employee-finance.component.css'
})
export class EmployeeFinanceComponent implements OnInit {

  canViewBank: boolean = false;
  canViewDD: boolean = false;
  canViewW4: boolean = false;

  ngOnInit(): void {
    this.loadTabPermissions();
  }

  loadTabPermissions(): void {

    const menus = JSON.parse(sessionStorage.getItem('Menus') || '[]');

    const bank = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'bank details'
    );

    const dd = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'dd'
    );

    const w4 = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'w4'
    );

    this.canViewBank = bank?.canView ?? false;
    this.canViewDD = dd?.canView ?? false;
    this.canViewW4 = w4?.canView ?? false;
  }
}