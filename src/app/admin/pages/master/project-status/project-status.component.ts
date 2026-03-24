import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ProjectStatus } from '../../../servies/admin.service';
@Component({
  selector: 'app-project-status',
  standalone: false,
  templateUrl: './project-status.component.html',
  styleUrl: './project-status.component.css'
})
export class ProjectStatusComponent {
  userId!: number;
  companyId!: number;
  regionId!: number;
companies: any[] = [];
regions: any[] = [];
allRegions: any[] = [];
filteredRegions: any[] = [];

 status!: ProjectStatus;

  statuses: ProjectStatus[] = [];
  statusesModel: any = {};

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';
  currentPage = 1;
  pageSize = 5;

  sortColumn = 'ProjectStatusID';
  sortDirection: 'asc' | 'desc' = 'desc';

  showUploadPopup = false;

  constructor(private adminService: AdminService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    if (!this.userId) {
      console.error("UserId missing in sessionStorage");
      return;
    }
  this.status = this.getEmptyStatus();  
   this.loadCompaniesAndRegions();
   
     this.loadStatuses();
  }
  loadCompaniesAndRegions() {
  this.adminService.getCompanies(null, this.userId).subscribe({
    next: (companyRes: any) => {

      this.companies = companyRes?.data?.data || companyRes || [];

      this.adminService.getRegions(null, this.userId).subscribe({
        next: (regionRes: any) => {

          this.allRegions = regionRes?.data?.data || regionRes || [];

          // NOW categories load AFTER both are ready
          this.loadStatuses();
        }
      });
    }
  });
}

  onCompanyChange(): void {

  const selectedCompanyId = Number(this.status.CompanyId);

  this.filteredRegions = this.allRegions.filter(
    r => Number(r.companyID) === selectedCompanyId
  );

  // If region does not belong to selected company → reset
  const regionExists = this.filteredRegions.some(
    r => r.regionID == this.status.RegionId
  );

  if (!regionExists) {
    this.status.RegionId = 0;
  }
}

  getEmptyStatus(): ProjectStatus {
    return {
      ProjectStatusID: 0,
      ProjectStatusName: '',
      IsActive: true,
      CompanyId: this.companyId,
      RegionId: this.regionId,
      UserId: this.userId
    };
  }

loadStatuses(): void {
  this.spinner.show();
  this.adminService.getProjectStatuses(this.userId).subscribe({
    next: res => {

      const rawData = res.data || [];

      this.statuses = rawData.map((item: any) => {

        const company = this.companies.find(
          c => Number(c.companyId) === Number(item.companyId)
        );

        const region = this.allRegions.find(
          r => Number(r.regionID) === Number(item.regionId)
        );

        return {
          ProjectStatusID: item.projectStatusId,
          ProjectStatusName: item.projectStatusName,
          IsActive: item.isActive,
          CompanyId: item.companyId,
          RegionId: item.regionId,
          UserId: item.userId,
          CompanyName: company ? company.companyName : '',
          RegionName: region ? region.regionName : ''
        };
      });

      this.spinner.hide();
    },
    error: () => {
      this.spinner.hide();
      Swal.fire('Error', 'Failed to load Project Statuses.', 'error');
    }
  });
}


   loadCompanies() {
  this.adminService.getCompanies(null, this.userId).subscribe({
    next: (res: any) => {
      this.companies = res?.data?.data || res || [];
    }
  });
}


loadRegions() {
  this.adminService.getRegions(null, this.userId).subscribe({
    next: (res: any) => {

      this.allRegions = res?.data?.data || res || [];

      console.log("All Regions:", this.allRegions);

      // If company already selected → filter immediately
      if (this.status.CompanyId) {
        this.onCompanyChange();
      }
    }
  });
}

  onSubmit(): void {
    this.status.UserId = this.userId;
    this.spinner.show();
    if (this.isEditMode) {
      this.adminService.updateProjectStatus(this.status).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Updated', `${this.status.ProjectStatusName} updated successfully!`, 'success');
          this.loadStatuses();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Update failed.', 'error');
        }
      });
    } else {
      this.adminService.createProjectStatus(this.status).subscribe({
        next: () => {
          this.spinner.hide();
          Swal.fire('Created', `${this.status.ProjectStatusName} added successfully!`, 'success');
          this.loadStatuses();
          this.resetForm();
        },
        error: () => {
          this.spinner.hide();
          Swal.fire('Error', 'Create failed.', 'error');
        }
      });
    }
  }

  editStatus(s: ProjectStatus): void {
    this.status = { ...s };
    this.onCompanyChange();
    this.isEditMode = true;
  }

  deleteStatus(s: ProjectStatus): void {
    Swal.fire({
      title: `Delete ${s.ProjectStatusName}?`,
      showDenyButton: true,
      confirmButtonText: 'Confirm'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteProjectStatus(s.ProjectStatusID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted', `${s.ProjectStatusName} deleted successfully.`, 'success');
            this.loadStatuses();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed.', 'error');
          }
        });
      }
    });
  }

  resetForm(): void {
    this.status = this.getEmptyStatus();
    this.isEditMode = false;
  }

  /** Filtering + Sorting + Pagination */
  filteredStatuses(): ProjectStatus[] {
    return this.statuses.filter(s => {
      const matchesSearch = s.ProjectStatusName.toLowerCase().includes(this.searchText.toLowerCase());
      const matchesStatus = this.statusFilter === '' || s.IsActive === this.statusFilter;
      return matchesSearch && matchesStatus;
    });
  }

  sortTable(column: string) {
    if (this.sortColumn === column) this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else this.sortColumn = column; this.sortDirection = 'asc';
  }

  get pagedStatuses(): ProjectStatus[] {
    const filtered = this.filteredStatuses();
    filtered.sort((a: any, b: any) => {
      const valA = a[this.sortColumn]?.toString().toLowerCase() || '';
      const valB = b[this.sortColumn]?.toString().toLowerCase() || '';
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredStatuses().length / this.pageSize) || 1;
  }

  goToPage(page: number): void {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  /** Export */
  exportAs(type: 'excel' | 'pdf') {
    type === 'excel' ? this.exportExcel() : this.exportPDF();
  }

  exportExcel() {
    const data = this.statuses.map(s => ({
      'Project Status': s.ProjectStatusName,
      'Active': s.IsActive ? 'Yes' : 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ProjectStatuses');
    XLSX.writeFile(wb, 'ProjectStatuses.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const data = this.statuses.map(s => [s.ProjectStatusName, s.IsActive ? 'Yes' : 'No']);
    autoTable(doc, { head: [['Project Status', 'Active']], body: data });
    doc.save('ProjectStatuses.pdf');
  }

  /** Bulk Upload */
  openUploadPopup() { this.showUploadPopup = true; }
  closeUploadPopup() { this.showUploadPopup = false; }

  onBulkUploadComplete(data: any): void {
    if (!data || !data.length) {
      Swal.fire('Info', 'No valid data found in uploaded file.', 'info');
      return;
    }
    this.adminService.bulkInsertData('ProjectStatus', data).subscribe({
      next: () => {
        Swal.fire('Success', 'Project Status data uploaded successfully!', 'success');
        this.loadStatuses();
        this.closeUploadPopup();
      },
      error: () => Swal.fire('Error', 'Failed to upload data.', 'error')
    });
  }
}
