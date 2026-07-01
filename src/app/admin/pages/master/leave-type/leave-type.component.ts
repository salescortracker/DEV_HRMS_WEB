import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AdminService, LeaveType, Company, Region } from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-leave-type',
  standalone: false,
  templateUrl: './leave-type.component.html',
  styleUrl: './leave-type.component.css'
})
export class LeaveTypeComponent {
    companies: Company[] = [];
  regions: Region[] = [];
companyLoaded = false;
userId = Number(sessionStorage.getItem("UserId"));
  companyId: number = Number(sessionStorage.getItem('CompanyId')) || 0;
  regionId: number = Number(sessionStorage.getItem('RegionId')) || 0;
companyMap: { [key: number]: string } = {};
  regionMap: { [key: number]: string } = {};
  leave: any = this.getEmptyLeaveType();
  
  leaveTypeList: LeaveType[] = [];

  isEditMode = false;
  searchText = '';
  statusFilter: boolean | '' = '';

  currentPage = 1;
  pageSize = 5;

  sortColumn = 'LeaveTypeName';
  sortDirection: 'asc' | 'desc' = 'asc';

  showUploadPopup = false;
  filteredRegions: Region[] = [];

  constructor(
    private admin: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  // ================= INIT =================
  ngOnInit(): void {
    this.loadRegions();
    this.loadCompanies();
        this.loadGrades();
    this.loadLeaveType();
  }
grades: any[] = [];

loadGrades() {
  console.log('Loading grades for userId:', this.userId);
  this.admin.getGrades(this.userId).subscribe((res:any) => {
    this.grades = res.data;
    console.log('Grades loaded:', this.grades);

  });
}
  // ================= MASTER DATA =================
getEmptyLeaveType(): any {
  return {
    leaveTypeID: 0,
    leaveTypeName: '',
    leaveDays: 1,
    IsActive: true,
    CompanyID: this.companyId,
    RegionID: this.regionId,
    // companyName: this.companyMap[this.companyId] || '',
    // regionName: this.regionMap[this.regionId] || '',
    // userId: Number(sessionStorage.getItem("UserId"))
     gradeAllocations: [],
    userId: this.userId,
  };
}

  


  // ================= DROPDOWN EVENTS =================
  onCompanyChange(): void {
    sessionStorage.setItem('CompanyId', this.companyId.toString());

    this.regionId = 0;
    this.regions = [];
    this.leave.CompanyID = this.companyId;
    this.filteredRegions = this.regions.filter((r: Region) => r.companyID === this.companyId);

    this.loadRegions();
  }

  onRegionChange(): void {
    sessionStorage.setItem('RegionId', this.regionId.toString());
    this.leave.RegionID = this.regionId;
    this.loadLeaveType();
  }

  // ================= CRUD =================
loadLeaveType(): void {
  if (!this.companyId || !this.regionId) return;
  this.spinner.show();
  this.admin.getLeaveType().subscribe({
  next: (res: LeaveType[]) => {
   this.leaveTypeList = res;
    this.spinner.hide();
  },
  error: () => {
    this.spinner.hide();
    Swal.fire('Error', 'Failed to load Leave Types.', 'error');
  }
});

}

 onSubmit(): void {

  if (this.leave.gradeAllocations.length === 0) {
    Swal.fire('Error', 'Please select at least one grade', 'error');
    return;
  }

  // ✅ Assign Required Fields
  this.leave.CompanyID = this.companyId;
  this.leave.RegionID = this.regionId;
  this.leave.userId = this.userId;

  this.leave.companyName =
    this.companyMap[this.companyId] || '';

  this.leave.regionName =
    this.regionMap[this.regionId] || '';

  this.spinner.show();

  const obs = this.isEditMode
    ? this.admin.updateLeaveType(this.leave)
    : this.admin.createLeaveType(this.leave);

  obs.subscribe({

    next: (res: any) => {

      this.spinner.hide();

      Swal.fire(
        'Success',
        res?.message || 'Saved successfully',
        'success'
      );

      this.loadLeaveType();
      this.resetForm();
    },

    error: (err) => {

      this.spinner.hide();

      Swal.fire(
        'Error',
        err?.error?.message || 'Operation failed',
        'error'
      );
    }
  });
}

//  editLeaveType(item: LeaveType): void {
  
//   this.isEditMode = true;

//   this.leave = { ...item };

//   this.companyId = item.CompanyID;
//   this.filteredRegions = this.regions.filter((r: Region) => r.companyID === this.companyId);
//   this.admin.getRegions(this.companyId).subscribe({
//     next: (res: Region[]) => {
//       this.regions = res || [];
//       this.regionId = item.RegionID;
//       this.leave.CompanyID = this.companyId;
//       this.leave.RegionID = this.regionId;
//       this.loadLeaveType(); 
//              this.spinner.hide();

//     },
//     error: () => Swal.fire('Error', 'Failed to load regions', 'error')
//   });
// }
editLeaveType(item: any): void {
  this.isEditMode = true;
  console.log('Editing item:', item); 

  this.leave = {
    ...item,
    gradeAllocations: item.gradeAllocations || [] 
  };

  this.companyId = Number(item.companyID);
this.regionId = Number(item.regionID);
}

// ✅ CHECKBOX TOGGLE
onGradeToggle(grade: any, event: any) {

  if (event.target.checked) {

    this.leave.gradeAllocations.push({
      gradeID: grade.gradeID,
      gradename: grade.gradeName,
      leaveDays: 0
    });

  } else {

    this.leave.gradeAllocations =
      this.leave.gradeAllocations.filter(
        (x: any) => x.gradeID !== grade.gradeID
      );
  }
}

// ✅ INPUT CHANGE
onGradeDaysChange(grade: any, event: any) {
  const value = +event.target.value;

  const item = this.leave.gradeAllocations.find(
    (x: any) => x.gradeID === grade.gradeID
  );

  if (item) {
    item.leaveDays = value;
  }
}

// ✅ HELPER (for checkbox checked state in edit)
isGradeSelected(gradeId: number): boolean {
  return this.leave.gradeAllocations.some((x: any) => x.gradeID === gradeId);
}

// ✅ HELPER (for input value in edit)
getGradeDays(gradeId: number): number {
  const item = this.leave.gradeAllocations.find(
    (x: any) => x.gradeID === gradeId
  );
  return item ? item.leaveDays : 0;
}

  deleteLeaveType(item: LeaveType): void {
  Swal.fire({
    title: `Delete "${item.leaveTypeName}"?`,
    showCancelButton: true,
    confirmButtonText: 'Delete'
  }).then(result => {
    if (result.isConfirmed) {

      this.spinner.show();

      this.admin.deleteLeaveType(item.leaveTypeID).subscribe({
        next: (res: any) => {
          this.spinner.hide();

          Swal.fire('Deleted', res.message, 'success');
          this.loadLeaveType();
        },
        error: (err) => {
          this.spinner.hide();

          Swal.fire(
            'Error',
            err?.error?.message || 'You cannot delete this leave type. It is assigned to one or more leave requests.',
            'error'
          );
        }
      });
    }
  });
}
  // resetForm(): void {
  // this.leave = {
  //     leaveTypeID: 0,
  //     leaveTypeName: '',
  //     leaveDays: 1,
  //     IsActive: true,
  //     CompanyID: this.companyId,
  //     RegionID: this.regionId,
  //     companyName: this.companyMap[this.companyId],
  //     regionName: this.regionMap[this.regionId]
  //   };

  //   this.isEditMode = false;
  // }
  resetForm(): void {
  this.leave = this.getEmptyLeaveType();
  this.isEditMode = false;
}

  // ================= FILTER + SORT + PAGE =================
  filteredLeaveType(): LeaveType[] {
    return this.leaveTypeList.filter(c => {
      const matchSearch = c.leaveTypeName.toLowerCase().includes(this.searchText.toLowerCase());
      const matchStatus = this.statusFilter === '' || c.IsActive === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  get pagedLeaveType(): LeaveType[] {
    const filtered = this.filteredLeaveType();

    filtered.sort((a: any, b: any) => {
      const valA = a[this.sortColumn];
      const valB = b[this.sortColumn];
      return this.sortDirection === 'asc'
        ? valA < valB ? -1 : 1
        : valA > valB ? -1 : 1;
    });

    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredLeaveType().length / this.pageSize) || 1;
  }

  goToPage(page: number): void {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
  }

  sortTable(column: string) {
    if (this.sortColumn === column)
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  // ================= EXPORT =================
  exportAs(type: 'excel' | 'pdf') {
    type === 'excel' ? this.exportExcel() : this.exportPDF();
  }

  exportExcel() {
    const data = this.leaveTypeList.map(c => ({
      'Company': c.companyName,
      'Region': c.regionName,
      'Leave Type': c.leaveTypeName,
      'Days': c.leaveDays,
      'Active': c.IsActive ? 'Yes' : 'No'
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Types');
    XLSX.writeFile(wb, 'LeaveType.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF();
    const data = this.leaveTypeList.map(c => [
      c.companyName || '',
      c.regionName || '',
      c.leaveTypeName || '',
      c.leaveDays || '',
      c.IsActive ? 'Yes' : 'No'
    ]);
    autoTable(doc, { head: [['Company', 'Region', 'Leave Type', 'Days', 'Active']], body: data });
    doc.save('LeaveType.pdf');
  }

  // ================= BULK UPLOAD =================
  openUploadPopup() { 
    this.leaveTypeModel = {};
    this.showUploadPopup = true; 
  }
  closeUploadPopup() { this.showUploadPopup = false; }


  leaveTypeModel: any = {};

onBulkUploadComplete(event: any) {
  console.log('Bulk upload completed', event);
  this.closeUploadPopup();
  this.loadLeaveType();
}
loadCompanies(): void {
  this.admin.getCompanies(null, this.userId).subscribe({
    next: (res: Company[]) => {
      this.companies = res.filter(c => c.isActive);
      // build companyMap
      this.companies.forEach(c => this.companyMap[c.companyId] = c.companyName);
    },
    error: () => Swal.fire('Error', 'Failed to load companies.', 'error')
  });
}

loadRegions(): void {
  this.admin.getRegions(null, this.userId).subscribe({
    next: (res: Region[]) => {
      this.regions = res.filter(r => r.isActive);
      this.filteredRegions = this.regions.filter(r => r.companyID === this.companyId);
      // build regionMap
      this.regions.forEach(r => this.regionMap[r.regionID] = r.regionName);
    },
    error: () => Swal.fire('Error', 'Failed to load regions.', 'error')
  });
}
}
