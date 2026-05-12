import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { AdminService } from '../../servies/admin.service';

export interface EventType {
  eventTypeID: number;
  eventTypeName: string;
  description?: string;

  isActive: boolean;

  companyID: number;
  regionId: number;

  companyName?: string;
  regionName?: string;

  userId: number;
}


@Component({
  selector: 'app-eventtype',
  standalone: false,
  templateUrl: './eventtype.component.html',
  styleUrl: './eventtype.component.css'
})
export class EventtypeComponent implements OnInit {

  // ------------------------------------------------------------
  // 🔹 Variables
  // ------------------------------------------------------------

  eventTypes: EventType[] = [];

  eventType: EventType = this.getEmptyEventType();

  isEditMode = false;

  showUploadPopup = false;

  searchText = '';

  statusFilter: boolean | '' = '';

  pageSize = 5;

  currentPage = 1;

  Math = Math;

  companies: any[] = [];

  regions: any[] = [];

  filteredRegions: any[] = [];

  companyMap: { [key: number]: string } = {};

  regionMap: { [key: number]: string } = {};

  userId: number =
    sessionStorage.getItem('UserId')
      ? Number(sessionStorage.getItem('UserId'))
      : 0;

  companyId: any ;

  regionId: any ;

  // ------------------------------------------------------------
  // 🔹 Constructor
  // ------------------------------------------------------------

  constructor(
    private adminservice: AdminService,
    private spinner: NgxSpinnerService
  ) { }

  // ------------------------------------------------------------
  // 🔹 Init
  // ------------------------------------------------------------

  ngOnInit(): void {
 const currentUser: any = JSON.parse(
  sessionStorage.getItem('currentUser') || '{}'
);

this.userId = currentUser.userId || 0;

this.companyId=currentUser.companyId || 0;

this.regionId = currentUser.regionId || 0;
console.log('UserId:', this.userId);
console.log('CompanyId:', this.companyId);
console.log('RegionId:', this.regionId);
    this.loadCompanies();

    this.loadRegions();

    this.loadEventTypes();
  }

  // ------------------------------------------------------------
  // 🔹 Empty Model
  // ------------------------------------------------------------

  getEmptyEventType(): EventType {

    return {

      eventTypeID: 0,

      eventTypeName: '',

      description: '',

      isActive: true,

      companyID: 0,

      regionId: 0,

      companyName: '',

      regionName: '',

      userId: this.userId
    };
  }

  // ------------------------------------------------------------
  // 🔹 Company Change
  // ------------------------------------------------------------

  onCompanyChange(): void {

    this.filteredRegions = this.regions.filter((r: any) =>
      Number(r.companyID) === Number(this.eventType.companyID)
    );

    this.eventType.regionId = 0;
  }

  // ------------------------------------------------------------
  // 🔹 Load Event Types
  // ------------------------------------------------------------

  loadEventTypes(): void {

    this.spinner.show();

    this.adminservice
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

  // ------------------------------------------------------------
  // 🔹 Submit
  // ------------------------------------------------------------

  onSubmit(): void {

    this.spinner.show();
this.eventType.userId = this.userId;
console.log('Submitting Event Type:', this.eventType);
    if (this.isEditMode) {
this.eventType.userId = this.userId;
console.log('Submitting Event Type:', this.eventType);
      this.adminservice
        .updateEventType(this.eventType)
        .subscribe({

          next: (res: any) => {

            this.spinner.hide();

            if (
              res.message
                .toLowerCase()
                .includes('duplicate')
            ) {

              Swal.fire(
                'Warning',
                res.message,
                'warning'
              );

              return;
            }

            Swal.fire(
              'Success',
              'Event Type updated successfully!',
              'success'
            );

            this.loadEventTypes();

            this.resetForm();
          },

          error: () => {

            this.spinner.hide();

            Swal.fire(
              'Error',
              'Update failed.',
              'error'
            );
          }
        });

    } else {

      this.adminservice
        .createEventType(this.eventType)
        .subscribe({

          next: (res: any) => {

            this.spinner.hide();

            if (
              res.message
                .toLowerCase()
                .includes('duplicate')
            ) {

              Swal.fire(
                'Warning',
                res.message,
                'warning'
              );

              return;
            }

            Swal.fire(
              'Success',
              'Event Type added successfully!',
              'success'
            );

            this.loadEventTypes();

            this.resetForm();
          },

          error: () => {

            this.spinner.hide();

            Swal.fire(
              'Error',
              'Create failed.',
              'error'
            );
          }
        });
    }
  }

  // ------------------------------------------------------------
  // 🔹 Edit
  // ------------------------------------------------------------

  editEventType(e: EventType): void {

    this.eventType = {

      ...e,

      companyID: Number(e.companyID),

      regionId: Number(e.regionId)
    };

    this.isEditMode = true;

    this.filteredRegions = this.regions.filter((r: any) =>
      Number(r.companyID) === Number(this.eventType.companyID)
    );
  }

  // ------------------------------------------------------------
  // 🔹 Delete
  // ------------------------------------------------------------

  deleteEventType(e: EventType): void {

    Swal.fire({

      title: `Are you sure you want to delete ${e.eventTypeName}?`,

      showDenyButton: true,

      confirmButtonText: 'Confirm'

    }).then((result) => {

      if (result.isConfirmed) {

        this.spinner.show();

        this.adminservice
          .deleteEventType(e.eventTypeID)
          .subscribe({

            next: () => {

              this.spinner.hide();

              Swal.fire(
                'Deleted!',
                'Event Type deleted successfully.',
                'success'
              );

              this.loadEventTypes();
            },

            error: () => {

              this.spinner.hide();

              Swal.fire(
                'Error',
                'Delete failed.',
                'error'
              );
            }
          });
      }
    });
  }

  // ------------------------------------------------------------
  // 🔹 Reset
  // ------------------------------------------------------------

  resetForm(): void {

    this.eventType = this.getEmptyEventType();

    this.isEditMode = false;
  }

  onCancel(): void {

    this.resetForm();
  }

  // ------------------------------------------------------------
  // 🔹 Search Filter
  // ------------------------------------------------------------

  filteredEventTypes(): EventType[] {

    const search = this.searchText.toLowerCase();

    return this.eventTypes.filter(e => {

      const matchesSearch =
        e.eventTypeName
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        this.statusFilter === ''
          || e.isActive === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  // ------------------------------------------------------------
  // 🔹 Pagination
  // ------------------------------------------------------------

  get totalPages(): number {

    return Math.ceil(
      this.filteredEventTypes().length / this.pageSize
    );
  }

  goToPage(page: number): void {

    if (
      page < 1
      || page > this.totalPages
    ) return;

    this.currentPage = page;
  }

  get pagedEventTypes(): EventType[] {

    const start =
      (this.currentPage - 1) * this.pageSize;

    return this.filteredEventTypes()
      .slice(start, start + this.pageSize);
  }

  // ------------------------------------------------------------
  // 🔹 Export Excel
  // ------------------------------------------------------------

  exportExcel(): void {

    const exportData = this.eventTypes.map(e => ({

      'Event Type': e.eventTypeName,

      'Description': e.description,

      'Company': e.companyName,

      'Region': e.regionName,

      'Status': e.isActive ? 'Active' : 'Inactive'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);

    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      ws,
      'EventTypes'
    );

    XLSX.writeFile(
      wb,
      'EventTypeList.xlsx'
    );
  }

  // ------------------------------------------------------------
  // 🔹 Export PDF
  // ------------------------------------------------------------


  // ------------------------------------------------------------
  // 🔹 Load Companies
  // ------------------------------------------------------------

  loadCompanies(): void {

    this.adminservice
      .getCompanies(null, this.userId)
      .subscribe({

        next: (res: any[]) => {

          this.companies =
            (res || [])
              .filter((c: any) => c.isActive);

          this.companyMap = {};

          this.companies.forEach((c: any) => {

            this.companyMap[c.companyId]
              = c.companyName;
          });
        },

        error: () => {

          Swal.fire(
            'Error',
            'Failed to load companies.',
            'error'
          );
        }
      });
  }

  // ------------------------------------------------------------
  // 🔹 Load Regions
  // ------------------------------------------------------------

  loadRegions(): void {

    this.adminservice
      .getRegions(null, this.userId)
      .subscribe({

        next: (res: any[]) => {

          this.regions =
            (res || [])
              .filter((r: any) => r.isActive);

          this.regionMap = {};

          this.regions.forEach((r: any) => {

            this.regionMap[r.regionID]
              = r.regionName;
          });
        },

        error: () => {

          Swal.fire(
            'Error',
            'Failed to load regions.',
            'error'
          );
        }
      });
  }
}
