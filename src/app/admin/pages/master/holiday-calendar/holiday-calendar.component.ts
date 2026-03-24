import { Component } from '@angular/core';
import { Holiday } from '../../../layout/models/holiday-calendar.model';
import { EmployeeResignation } from '../../../../features/employee-profile/employee-models/EmployeeResignation';
import { EmployeeResignationService } from '../../../../features/employee-profile/employee-services/employee-resignation.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-holiday-calendar',
  standalone: false,
  templateUrl: './holiday-calendar.component.html',
  styleUrl: './holiday-calendar.component.css'
})
export class HolidayCalendarComponent {
holiday: Holiday = { HolidayDate: '', HolidayName: '', HolidayType: '', Description: '', IsActive: true };
  // holidays: Holiday[] = [];
  isEditMode = false;
  searchText = '';
companyId!: number;
regionId!: number;
userId!: number;

birthdays: any[] = [];
approvedLeaves: any[] = [];
events: any[] = [];
holidays: any[] = [];
  currentPage = 1;
  pageSize = 5;
  
  constructor(private calendarService: EmployeeResignationService) {}
  ngOnInit(): void {
    const userData = sessionStorage.getItem('user');

  if (userData) {
    const user = JSON.parse(userData);

    this.companyId = user.companyId;
    this.regionId = user.regionId;
    this.userId = user.userId;

    this.loadCalendarData();
  }
  }
// loadCalendarData() {
//   this.calendarService.getHolidays(this.companyId, this.regionId)
//     .subscribe((res: any) => {
//       this.holidays = res.data;
//     });

//   this.calendarService.getBirthdays(this.companyId, this.regionId)
//     .subscribe((res: any) => {
//       this.birthdays = res.data;
//     });

//   this.calendarService.getApprovedLeaves(this.userId)
//     .subscribe((res: any) => {
//       this.approvedLeaves = res.data;
//     });

//   this.calendarService.getEvents(this.companyId, this.regionId)
//     .subscribe((res: any) => {
//       this.events = res.data;
//     });
// }

loadCalendarData() {
  debugger
  forkJoin({
    holidays: this.calendarService.getHolidays(this.companyId, this.regionId),
    birthdays: this.calendarService.getBirthdays(this.companyId, this.regionId),
    leaves: this.calendarService.getApprovedLeaves(this.userId),
    events: this.calendarService.getEvents(this.companyId, this.regionId)
  }).subscribe((res: any) => {

    this.holidays = res.holidays.data;
    this.birthdays = res.birthdays.data;
    this.approvedLeaves = res.leaves.data;
    this.events = res.events.data;

    this.mergeCalendarData();
  });
}
calendarEvents: any[] = [];
getBirthdayThisYear(dob: string) {
  const date = new Date(dob);
  const today = new Date();
  return new Date(today.getFullYear(), date.getMonth(), date.getDate());
}
mergeCalendarData() {
  this.calendarEvents = [];

  this.holidays.forEach(h => {
    this.calendarEvents.push({
      title: h.holidayName,
      date: h.holidayDate,
      type: 'Holiday'
    });
  });

  this.birthdays.forEach(b => {
    this.calendarEvents.push({
      title: `🎂 ${b.firstName} Birthday`,
      date: this.getBirthdayThisYear(b.dateOfBirth),
      type: 'Birthday'
    });
  });

  this.approvedLeaves.forEach(l => {
    this.calendarEvents.push({
      title: `🏖 Leave`,
      date: l.appliedDate,
      type: 'Leave'
    });
  });

  this.events.forEach(e => {
    this.calendarEvents.push({
      title: e.eventName,
      date: e.eventDate,
      type: 'Event'
    });
  });
}
  

  onSubmit() {
    if (this.isEditMode) {
      const index = this.holidays.findIndex(h => h.HolidayID === this.holiday.HolidayID);
      if (index !== -1) this.holidays[index] = { ...this.holiday };
    } else {
      const newId = this.holidays.length + 1;
      this.holidays.push({ HolidayID: newId, ...this.holiday });
    }
    this.resetForm();
  }

  editHoliday(h: Holiday) {
    this.isEditMode = true;
    this.holiday = { ...h };
  }

  deleteHoliday(h: Holiday) {
    this.holidays = this.holidays.filter(x => x.HolidayID !== h.HolidayID);
  }

  resetForm() {
    this.holiday = { HolidayDate: '', HolidayName: '', HolidayType: '', Description: '', IsActive: true };
    this.isEditMode = false;
  }

  // Filtering + Pagination
  filteredHolidays() {
    return this.holidays.filter(h =>
      h.HolidayName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  paginatedHolidays() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredHolidays().slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.filteredHolidays().length / this.pageSize);
  }

  pagesArray() {
    return Array(this.totalPages()).fill(0).map((_, i) => i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages()) this.currentPage = page;
  }
}
