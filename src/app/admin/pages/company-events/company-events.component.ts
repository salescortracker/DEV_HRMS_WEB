import { Component } from '@angular/core';
import { AdminService } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { CompanyEventsService } from '../../../features/company-events/company-events.service';
@Component({
  selector: 'app-company-events',
  standalone: false,
  templateUrl: './company-events.component.html',
  styleUrl: './company-events.component.css'
})
export class CompanyEventsComponent {

  companies: any[] = [];
  regions: any[] = [];
  departments: any[] = [];

filteredRegions: any[] = [];
  eventsList: any[] = [];
  paginatedEvents: any[] = [];
  event: any = this.resetEvent();

  isEditMode = false;

  searchText = '';
  startDate = '';
  endDate = '';
showDepartmentDropdown = false;

filteredDepartments: any[] = [];
  userId!: number;
  companyId!: number;
  regionId!: number;
  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  constructor(private cmpservice: AdminService, private adminService: CompanyEventsService, private spinner: NgxSpinnerService) { }

  ngOnInit() {

    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    this.loadCompanies();
    this.loadRegions();
    this.loadDepartments();
    this.getEvents();
    this.loadEventTypes();
        this.onCompanyChange();


  }
onCompanyChange() {

  this.event.RegionId = null;
 this.event.DepartmentIds = [];
  this.filteredRegions = this.event.CompanyId
    ? this.regions.filter(r =>
        Number(r.companyID) === Number(this.event.CompanyId)
      )
    : [];
this.filterDepartments();
}
  loadCompanies() {
    this.cmpservice.getCompanies(null, this.userId).subscribe((res: any) => {
      this.companies = res;
    });
  }

  loadRegions() {
    this.cmpservice.getRegions(null, this.userId).subscribe(res => {
      this.regions = res;
    });
  }

  loadDepartments() {

    this.cmpservice.getDepartments(this.userId).subscribe((res: any) => {
      this.departments = res.data.data.filter((d: any) => d.isActive);
    });

  }
eventTypes:any[]=[];

 loadEventTypes(): void {

    this.spinner.show();

    this.cmpservice
      .getEventTypes(this.companyId, this.regionId, this.userId)
      .subscribe({

        next: (res: any) => {

          this.eventTypes = res.data.map((e: any) => ({

            ...e,

            companyID: Number(e.companyID),

            regionId: Number(e.regionId)

          }));

          this.eventTypes.sort(
            (a: any, b: any) =>
              b.eventTypeID - a.eventTypeID
          );

          this.spinner.hide();
        },

        error: () => {

          this.spinner.hide();

          Swal.fire(
            'Error',
            'Failed to load Event Types.',
            'error'
          );
        }
      });
  }

  getDepartmentName(id: number): string {

    const d = this.departments.find(
      x => Number(x.departmentId) === Number(id)
    );

    return d ? d.departmentName : '-';
  }

  // resetEvent() {

  //   return {

  //     Id: 0,
  //     CompanyId: this.companyId,
  //     RegionId: this.regionId,
  //     DepartmentId: null,

  //     EventTitle: '',
  //     EventDescription: '',

  //     EventDate: new Date(),
  //     EventDateString: new Date().toISOString().split('T')[0],

  //     StartTime: '',
  //     EndTime: '',

  //     MeetingLink: '',
  //     EventLocation: '',
  //     EventType: '',

  //     IsMeeting: false
  //     , userId: this.userId
  //   }

  // }

  resetEvent() {
  return {
    Id: 0,
    CompanyId: this.companyId,
    RegionId: this.regionId,

    DepartmentId: null,
    DepartmentIds: [],

    EventTitle: '',
    EventDescription: '',
    EventDate: new Date(),
    EventDateString: new Date().toISOString().split('T')[0],

    StartTime: '',
    EndTime: '',

    MeetingLink: '',
    EventLocation: '',
    EventType: '',

    IsMeeting: false,
    userId: this.userId
  };
}

  resetForm() {

    this.event = this.resetEvent();
    this.isEditMode = false;

  }

  getEvents() {

    this.spinner.show();

    this.adminService.getAllEvents(this.userId).subscribe(res => {

      this.eventsList = res.map((e: any) => ({

        Id: e.id,
        CompanyId: e.companyId,
        RegionId: e.regionId,
        // DepartmentId: e.departmentId,
DepartmentIds: e.departmentIds || [],
        EventTitle: e.eventTitle,
        EventDescription: e.eventDescription,

        EventDate: new Date(e.eventDate),
        EventDateString: e.eventDate,

        StartTime: e.startTime,
        EndTime: e.endTime,

        MeetingLink: e.meetingLink,
        EventLocation: e.eventLocation,
        EventType: e.eventType,

        IsMeeting: e.isMeeting

      }));

      this.setPagination();
      this.spinner.hide();

    });

  }

  onSubmit() {

    const payload = {

      id: this.event.Id ?? 0,

      companyId: Number(this.event.CompanyId),
      regionId: Number(this.event.RegionId),
      // departmentId: Number(this.event.DepartmentId),
      departmentIds: this.event.DepartmentIds,
      userId: this.userId,
      eventTitle: this.event.EventTitle,
      eventDescription: this.event.EventDescription,

      eventDate: this.event.EventDateString,

      startTime: this.event.StartTime,
      endTime: this.event.EndTime,

      meetingLink: this.event.MeetingLink,

      eventLocation: this.event.EventLocation,
      eventType: this.event.EventType,

      isMeeting: this.event.IsMeeting,

      createdBy: this.userId

    };

    this.spinner.show();

    const request$ = this.isEditMode
      ? this.adminService.updateEvent(payload)
      : this.adminService.createEvent(payload);

    request$.subscribe(() => {

      Swal.fire('Success', 'Event saved successfully', 'success');
      this.getEvents();
      this.resetForm();
      this.spinner.hide();

    });

  }

  editEvent(e: any) {

    this.isEditMode = true;

    this.event = { ...e };

    this.event.EventDateString = new Date(e.EventDate).toISOString().split('T')[0];

      // ✅ FILTER REGIONS BASED ON COMPANY
  this.filteredRegions = this.regions.filter(r =>
    Number(r.companyID) === Number(this.event.CompanyId)
  );

  }

  confirmDelete(e: any) {

    Swal.fire({
      title: 'Delete Event?',
      icon: 'warning',
      showCancelButton: true
    }).then(res => {

      if (res.isConfirmed) {

        this.adminService.deleteEvent(e.Id).subscribe(() => {

          Swal.fire('Deleted', 'Event removed', 'success');
          this.getEvents();

        });

      }

    });

  }

  filteredEvents() {

    return this.eventsList.filter(e => {

      const matchText = e.EventTitle.toLowerCase().includes(this.searchText.toLowerCase());

      const matchStart = this.startDate ? new Date(e.EventDate) >= new Date(this.startDate) : true;
      const matchEnd = this.endDate ? new Date(e.EventDate) <= new Date(this.endDate) : true;

      return matchText && matchStart && matchEnd;

    });

  }

  setPagination(): void {

    const filtered = this.filteredEvents();

    this.totalPages = Math.ceil(filtered.length / this.pageSize) || 1;

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedEvents = filtered.slice(start, end);
  }

  changePage(page: number): void {

    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.setPagination();
  }

  nextPage(): void {

    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.setPagination();
    }
  }

  prevPage(): void {

    if (this.currentPage > 1) {
      this.currentPage--;
      this.setPagination();
    }
  }


  filterDepartments() {

  this.filteredDepartments = this.departments.filter((d: any) =>

    Number(d.companyId) === Number(this.event.CompanyId) &&

    Number(d.regionId) === Number(this.event.RegionId)

  );

}

onRegionChange() {

  this.event.DepartmentIds = [];

  this.filterDepartments();

}

toggleAllDepartments(event: any) {

  if (event.target.checked) {

    this.event.DepartmentIds =
      this.filteredDepartments.map(
        (d: any) => d.departmentId
      );

  } else {

    this.event.DepartmentIds = [];

  }
}
onDepartmentChange(event: any, departmentId: number) {

  if (!this.event.DepartmentIds) {
    this.event.DepartmentIds = [];
  }

  if (event.target.checked) {

    this.event.DepartmentIds.push(departmentId);

  } else {

    this.event.DepartmentIds =
      this.event.DepartmentIds.filter(
        (id: number) => id !== departmentId
      );
  }
}

isAllDepartmentsSelected(): boolean {

  return this.filteredDepartments.length > 0 &&
         this.event.DepartmentIds.length ===
         this.filteredDepartments.length;
}

getSelectedDepartmentNames(): string {

  if (!this.event.DepartmentIds?.length) {
    return 'Select Departments';
  }

  const names = this.filteredDepartments
    .filter(d =>
      this.event.DepartmentIds.includes(d.departmentId)
    )
    .map(d => d.departmentName);

  return names.join(', ');
}

getDepartmentNames(ids: number[]): string {
debugger;
  if (!ids || ids.length === 0) {
    return '-';
  }

  return this.departments
    .filter(d => ids.includes(d.departmentId))
    .map(d => d.departmentName)
    .join(', ');
}
}