import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-timesheet-management',
  standalone: false,
  templateUrl: './timesheet-management.component.html',
  styleUrl: './timesheet-management.component.css'
})
export class TimesheetManagementComponent implements OnInit {

  canViewSubmitTimesheet = false;
  canViewApproveTimesheet = false;
  canViewTimesheetReport = false;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadTabPermissions();

    // if (this.canViewSubmitTimesheet) {
    //   this.router.navigate(['/timesheet/submit-timesheet']);
    // }
    // else if (this.canViewApproveTimesheet) {
    //   this.router.navigate(['/timesheet/approve-timesheet']);
    // }
    // else if (this.canViewTimesheetReport) {
    //   this.router.navigate(['/timesheet/timesheet-report']);
    // }
  }

  loadTabPermissions(): void {

    const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

    const submit = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === "submit timesheet"
    );

    const approve = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === "approve timesheet"
    );

    const report = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === "timesheet report"
    );

    this.canViewSubmitTimesheet = submit?.canView ?? false;
    this.canViewApproveTimesheet = approve?.canView ?? false;
    this.canViewTimesheetReport = report?.canView ?? false;

    console.log("Submit Timesheet:", this.canViewSubmitTimesheet);
    console.log("Approve Timesheet:", this.canViewApproveTimesheet);
    console.log("Timesheet Report:", this.canViewTimesheetReport);
  }
}
