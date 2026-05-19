import { Component } from '@angular/core';

@Component({
  selector: 'app-timesheet-management',
  standalone: false,
  templateUrl: './timesheet-management.component.html',
  styleUrl: './timesheet-management.component.css'
})
export class TimesheetManagementComponent {
canViewSubmitTimesheet = false;
canViewApproveTimesheet = false;
canViewTimesheetReport = false;
selectedTab: string = '';

ngOnInit() {
  this.loadTabPermissions();
}

loadTabPermissions() {

  const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  const submit = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "submit timesheet"
  );

  const approve = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "approve timesheet"
  );

  const report = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "timesheet report"
  );

  this.canViewSubmitTimesheet = submit?.canView ?? false;
  this.canViewApproveTimesheet = approve?.canView ?? false;
  this.canViewTimesheetReport = report?.canView ?? false;
  

  if (this.canViewSubmitTimesheet) this.selectedTab = 'tab1';
  else if (this.canViewApproveTimesheet) this.selectedTab = 'tab2';
  else if (this.canViewTimesheetReport) this.selectedTab = 'tab3';
  

}

}
