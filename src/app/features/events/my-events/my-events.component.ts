import { Component, OnInit } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CompanyEventsService } from '../../company-events/company-events.service';

declare var bootstrap: any;

@Component({
  selector: 'app-my-events',
  standalone: false,
  templateUrl: './my-events.component.html',
  styleUrl: './my-events.component.css'
})
export class MyEventsComponent {
  eventsList: any[] = [];
  selectedEvent: any;

  companyId!: number;
  regionId!: number;
  departmentId!: number;

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    events: [],
    eventClick: this.handleEventClick.bind(this)
  };

  constructor(private eventService: CompanyEventsService) {}

  ngOnInit() {

    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
    this.departmentId = Number(sessionStorage.getItem("DepartmentId"));

    this.loadEvents();
  }

  loadEvents() {

    this.eventService
      .getAllDepartmentEvents(this.departmentId)
      .subscribe((res: any) => {
         debugger;
        this.eventsList = res;

        const calendarEvents = res.map((e: any) => ({
          title: e.eventTitle,
          date: e.eventDate,

          extendedProps: {
            time: e.startTime + " - " + e.endTime,
            location: e.eventLocation,
            meetingLink: e.meetingLink,
            description: e.description
          }
        }));

        this.calendarOptions.events = calendarEvents;

      });
  }


  handleEventClick(info: any) {

    this.selectedEvent = {
      title: info.event.title,
      date: info.event.start?.toDateString(),
      time: info.event.extendedProps.time,
      location: info.event.extendedProps.location,
      meetingLink: info.event.extendedProps.meetingLink,
      description: info.event.extendedProps.description
    };

    const modal = new bootstrap.Modal(
      document.getElementById('eventDetailsModal')
    );

    modal.show();
  }
}
