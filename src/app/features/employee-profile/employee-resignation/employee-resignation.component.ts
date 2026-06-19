import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { EmployeeResignationService } from '../employee-services/employee-resignation.service';
import { EmployeeResignation } from '../employee-models/EmployeeResignation';
import { commonConstants } from '../../../core/common';
import { Router } from '@angular/router';
type ColumnKey =
  | 'showIndex'
  | 'type'
  | 'notice'
  | 'lastDay'
  | 'reason'
  | 'status'
  | 'actions';
@Component({
  selector: 'app-employee-resignation',
  standalone: false,
  templateUrl: './employee-resignation.component.html',
  styleUrls: ['./employee-resignation.component.css']
})
export class EmployeeResignationComponent implements OnInit {
constructor(private router: Router) {}
  canViewResignation = false;
  canViewApproval = false;

 ngOnInit(): void {
  this.loadPermissions();

 
}

  loadPermissions(): void {

    const menus = JSON.parse(sessionStorage.getItem('Menus') || '[]');

    const resignation = menus.find(
      (m: any) =>
        m.menuName?.trim().toLowerCase() === 'resignation/exit'
    );

    const managerApproval = menus.find(
      (m: any) =>
        m.menuName?.trim().toLowerCase() === 'manager approval'
    );

    this.canViewResignation = resignation?.canView ?? false;
    this.canViewApproval = managerApproval?.canView ?? false;

    console.log('Resignation:', this.canViewResignation);
    console.log('Manager Approval:', this.canViewApproval);
  }
}
