import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../servies/admin.service';
@Component({
  selector: 'app-events-configuration',
  standalone: false,
  templateUrl: './events-configuration.component.html',
  styleUrl: './events-configuration.component.css'
})
export class EventsConfigurationComponent {
 events: any[] = [];
  isEditMode = false;

  event: any = this.getEmptyEvent();

  eventTypes = [
    { id: 1, name: 'Company Event' },
    { id: 2, name: 'Holiday' },
    { id: 3, name: 'Birthday' },
    { id: 4, name: 'Work Anniversary' },
    { id: 5, name: 'Optional Holiday' }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  getEmptyEvent() {
    return {
      eventId: 0,
      companyId: 1,
      regionId: 1,
      userId: 101,
      eventTypeId: '',
      eventName: '',
      eventDate: '',
      description: '',
      isActive: true,
      createdBy: 1,
      createdDate: new Date(),
      modifiedBy: null,
      modifiedDate: null,
      roleId: 1
    };
  }

  saveEvent() {
    if (!this.event.eventDate) return;

    // DateOnly format (IMPORTANT)
    this.event.eventDate = this.event.eventDate;

    if (this.isEditMode) {
      this.adminService.updateEvent(this.event)
        .subscribe(() => {
          this.loadEvents();
          this.resetForm();
        });
    } else {
      this.adminService.createEvent(this.event)
        .subscribe(() => {
          this.loadEvents();
          this.resetForm();
        });
    }
  }

  loadEvents() {
    this.adminService.getEvents()
      .subscribe(res => this.events = res);
  }

  editEvent(e: any) {
    this.event = { ...e };
    this.isEditMode = true;
  }

  deleteEvent(id: number) {
    this.adminService.deleteEvent(id)
      .subscribe(() => this.loadEvents());
  }

  resetForm() {
    this.event = this.getEmptyEvent();
    this.isEditMode = false;
  }
}
