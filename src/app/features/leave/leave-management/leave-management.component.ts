import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
interface Leave {
  date: string;  // yyyy-mm-dd
  type: string;
}
@Component({
  selector: 'app-leave-management',
  standalone: false,
  templateUrl: './leave-management.component.html',
  styleUrl: './leave-management.component.css'
})
export class LeaveManagementComponent implements OnInit {

  currentDate: Date = new Date();
  selectedView: 'month' | 'week' | 'day' = 'month';
  currentMonth: number = this.currentDate.getMonth();
  currentYear: number = this.currentDate.getFullYear();

  dates: { dateStr: string, day: string }[] = [];
  weeks: (number | null)[][] = [];

  canApplyLeave: boolean = false;
  canViewApproval: boolean = false;
  canViewCalendar: boolean = false;
  canViewReport: boolean = false;

  employees: string[] = ['John Doe', 'Jane Smith', 'Alice Brown'];
  selectedEmployee: string = 'John Doe';

  leaveData: { [employee: string]: Leave[] } = {
    'John Doe': [
      { date: '2025-10-15', type: 'Sick Leave' },
      { date: '2025-10-18', type: 'Casual Leave' }
    ],
    'Jane Smith': [
      { date: '2025-10-16', type: 'Paid Leave' }
    ],
    'Alice Brown': [
      { date: '2025-10-20', type: 'Sick Leave' }
    ]
  };

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadLeavePermissions();
    this.generateMonthDates(this.currentYear, this.currentMonth);

    // if (this.canApplyLeave) {
    //   this.router.navigate(['/leave-management/apply-leave']);
    // }
    // else if (this.canViewApproval) {
    //   this.router.navigate(['/leave-management/leave-approvals']);
    // }
    // else if (this.canViewCalendar) {
    //   this.router.navigate(['/leave-management/leave-calendar']);
    // }
    // else if (this.canViewReport) {
    //   this.router.navigate(['/leave-management/leave-report']);
    // }
  }

  loadLeavePermissions() {

    const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

    const parentMenu = menus.find((m: any) =>
      m.menuName?.trim().toLowerCase() === "leaves"
    );

    const parentId = parentMenu?.menuId;

    const leaveMenus = menus.filter(
      (m: any) => m.parentId === parentId
    );

    const getPermission = (menuName: string) => {
      return leaveMenus.find((m: any) =>
        m.menuName?.trim().toLowerCase() === menuName.toLowerCase()
      )?.canView ?? false;
    };

    this.canApplyLeave = getPermission("Leave Apply");
    this.canViewApproval = getPermission("Leave Approve");
    this.canViewCalendar = getPermission("Leave Calendar");
    this.canViewReport = getPermission("Leave Report");

    console.log("Apply Leave:", this.canApplyLeave);
    console.log("Leave Approval:", this.canViewApproval);
    console.log("Leave Calendar:", this.canViewCalendar);
    console.log("Leave Report:", this.canViewReport);
  }

  generateMonthDates(year: number, month: number) {
    this.weeks = [];

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    let day = 1 - firstDay;

    for (let w = 0; w < 6; w++) {
      const week: (number | null)[] = [];

      for (let d = 0; d < 7; d++) {
        week.push(day > 0 && day <= lastDate ? day : null);
        day++;
      }

      this.weeks.push(week);
    }
  }

  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }

    this.generateMonthDates(this.currentYear, this.currentMonth);
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }

    this.generateMonthDates(this.currentYear, this.currentMonth);
  }

  getWeekDates(startDate: Date): { dateStr: string, day: string }[] {

    const week: { dateStr: string, day: string }[] = [];

    for (let i = 0; i < 7; i++) {

      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const day = d.toLocaleString('en-US', {
        weekday: 'short'
      });

      const dateStr =
        `${d.getFullYear()}-${(d.getMonth() + 1)
          .toString()
          .padStart(2, '0')}-${d.getDate()
            .toString()
            .padStart(2, '0')}`;

      week.push({ dateStr, day });
    }

    return week;
  }

  getDayLeaves(date: string | null): Leave[] {
    return this.leaveData[this.selectedEmployee]
      ?.filter(l => l.date === date) || [];
  }

  isToday(day: number | null): boolean {

    if (!day) return false;

    return day === this.currentDate.getDate()
      && this.currentMonth === this.currentDate.getMonth()
      && this.currentYear === this.currentDate.getFullYear();
  }

  hasLeave(day: number | null): string | null {

    if (!day) return null;

    const dateStr =
      `${this.currentYear}-${(this.currentMonth + 1)
        .toString()
        .padStart(2, '0')}-${day
          .toString()
          .padStart(2, '0')}`;

    const leave =
      this.leaveData[this.selectedEmployee]
        ?.find(l => l.date === dateStr);

    return leave ? leave.type : null;
  }
}