import { Component } from '@angular/core';
import { EmployeeResignationService } from '../../employee-services/employee-resignation.service';
import { EmployeeResignation } from '../../employee-models/EmployeeResignation';
import { commonConstants } from '../../../../core/common';
import { NgForm } from '@angular/forms';
import { AdminService,ResignationModel } from '../../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
type ColumnKey =
  | 'showIndex'
  | 'type'
  | 'notice'
  | 'lastDay'
  | 'reason'
  | 'status'
  | 'actions';
@Component({
  selector: 'app-employee-resignation-details',
  standalone: false,
  templateUrl: './employee-resignation-details.component.html',
  styleUrl: './employee-resignation-details.component.css'
})
export class EmployeeResignationDetailsComponent {
 resignationTypes: ResignationModel[] = []; // fetched from master table
  resignations: EmployeeResignation[] = [];
  filteredResignations: EmployeeResignation[] = [];
  resignationModel: EmployeeResignation = { resignationType: '', hrEmail: ''  };

  employeeCode = commonConstants.employeeCode;
  employeeName = commonConstants.employeeName;
  filter = { resignationType: '', fromDate: '', toDate: '' };
  message = '';
  isEditMode = false;
  dateError = '';
  formSubmitted = false;

  // Pagination
  pageSize = 5;
  currentPage = 1;
  totalPages = 1;
  totalPagesArray: number[] = [];

  // Session Values
  companyId = Number(sessionStorage.getItem('CompanyId') || 0);
  regionId = Number(sessionStorage.getItem('RegionId') || 0);
  roleId = Number(sessionStorage.getItem('roleId'));

  activeTab: 'list' | 'manager' | 'hr' = 'list';
  roleName = '';
  designationName = '';
  isHR = false;
  employees: any[] = [];

  selectedEmployeeId: string | null = null;


  constructor(private resignationService: EmployeeResignationService,private adminService: AdminService) {}

  ngOnInit(): void {

  this.loadResignations();
  this.loadResignationTypes();
  this.roleName = (sessionStorage.getItem('roleName') || '').trim().toLowerCase();
  this.designationName = (sessionStorage.getItem('DesignationName') || '').trim().toLowerCase();

  this.isHR =
  this.roleName.includes('hr') ||
  this.roleName.includes('human') ||
  this.designationName.includes('hr') ||
  this.designationName.includes('human');

  if (this.isHR === true) {
    this.loadEmployees();   // ✅ guaranteed call
  }
}
  onEmployeeChange() {

  const emp = this.employees.find(
    x => x.employeeCode == this.selectedEmployeeId
  );

  if (!emp) return;

  this.employeeName = emp.fullName;
  this.employeeCode = emp.employeeCode;

  this.resignationModel.userId = emp.userId;
  this.resignationModel.employeeId = emp.employeeCode;
}
loadEmployees() {
  this.adminService.getUsersByCompanyRegion(this.companyId, this.regionId)
    .subscribe({
      next: (res: any) => {

        console.log('Employee API Response:', res);

        // ✅ SAFE FIX (handle both array & object response)
        this.employees = Array.isArray(res) ? res : (res?.data || res?.result || []);

      },
      error: (err) => {
        console.error('Employee API failed', err);
      }
    });
}
 loadResignationTypes() {
  debugger;
  this.adminService.getResignations(this.companyId, this.regionId)
    .subscribe({
      next: (res: ResignationModel[]) => {

        const active = res.filter(r => r.isActive);

        // 🔥 Allowed types for EMPLOYEE
        const employeeAllowedTypes = ['resignation', 'resign', 'res'];

        this.resignationTypes = this.isHR
          ? active
          : active.filter(x =>
              employeeAllowedTypes.includes(
                (x.resignationType || '').trim().toLowerCase()
              )
            );

      },
      error: (err) => console.error(err)
    });
}
 onResignationTypeChange() {
  const selected = this.resignationTypes.find(r => r.resignationType === this.resignationModel.resignationType);
  if (selected) {
    this.resignationModel.noticePeriod = selected.noticePeriodDays.toString(); // convert number to string
    this.setLastWorkingDay(this.resignationModel.noticePeriod);
  } else {
    this.resignationModel.noticePeriod = '';
  }
}
setLastWorkingDay(noticePeriodStr: string) {
  const today = new Date();
  const lastDay = new Date();
  lastDay.setDate(today.getDate() + parseInt(noticePeriodStr || '0'));

  // Format date as yyyy-MM-dd (required for input type="date")
  const formattedDate = lastDay.toISOString().split('T')[0];

  this.resignationModel.lastWorkingDay = formattedDate;
}
  // loadResignations() {
  //   this.resignationService.getAll(this.companyId, this.regionId, this.roleId).subscribe({
  //     next: (data) => {
  //       this.resignations = data;
  //       this.filteredResignations = data;
  //       this.updatePagination();
  //     },
  //     error: (err) => console.error('Error loading resignations:', err),
  //   });
  // }
  loadResignations() {
  const loggedEmployeeCode = sessionStorage.getItem('EmployeeCode');

  this.resignationService.getAll(this.companyId, this.regionId, this.roleId)
    .subscribe({
      next: (data) => {

        if (this.isHR) {
          // HR → see all data
          this.resignations = data;
        } else {
          // Employee → only own data
          this.resignations = data.filter(r =>
            r.employeeId === loggedEmployeeCode
          );
        }

        this.filteredResignations = this.resignations;
        this.updatePagination();
      },
      error: (err) => console.error('Error loading resignations:', err),
    });
}

  // ---------------- FILTER --------------------
  applyFilter() {
    const typeInput = (this.filter.resignationType || '').trim().toLowerCase();
    const fromDate = this.filter.fromDate ? new Date(this.filter.fromDate) : null;
    const toDate = this.filter.toDate ? new Date(this.filter.toDate) : null;

    this.filteredResignations = this.resignations.filter(item => {
      const itemType = (item.resignationType || '').trim().toLowerCase();
      const itemDate = item.lastWorkingDay ? new Date(item.lastWorkingDay) : null;

      const typeMatch = typeInput ? itemType.includes(typeInput) : true;
      const dateMatch =
        (!fromDate || (itemDate && itemDate >= fromDate)) &&
        (!toDate || (itemDate && itemDate <= toDate));

      return typeMatch && dateMatch;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  columns: Record<ColumnKey, boolean> = {
    showIndex: true,
    type: true,
    notice: true,
    lastDay: true,
    reason: true,
    status: true,
    actions: true
  };

  allColumns: { key: ColumnKey; label: string; visible: boolean }[] = [
    { key: 'showIndex', label: '#', visible: true },
    { key: 'type', label: 'Type', visible: true },
    { key: 'notice', label: 'Notice Period', visible: true },
    { key: 'lastDay', label: 'Last Working Day', visible: true },
    { key: 'reason', label: 'Reason', visible: true },
    { key: 'status', label: 'Status', visible: true },
    { key: 'actions', label: 'Actions', visible: true }
  ];

  updateVisibleColumns() {
    this.allColumns.forEach(col => {
      this.columns[col.key] = col.visible;
    });
  }

  resetFilter() {
    this.filter = { resignationType: '', fromDate: '', toDate: '' };
    this.filteredResignations = this.resignations;
    this.updatePagination();
  }

  // ---------------- Pagination --------------------
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredResignations.length / this.pageSize);
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // ---------------- Validation --------------------
  validateLastWorkingDay() {
    this.dateError = '';
    if (!this.resignationModel.lastWorkingDay) return;

    const selectedDate = new Date(this.resignationModel.lastWorkingDay);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.dateError = 'Last working day must be today or a future date.';
    }
  }

canSubmitResignation(): boolean {

  // ✅ HR → always allow
  if (this.isHR) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // normalize statuses once (performance + safety)
  const resignations = this.resignations || [];

  const hasApproved = resignations.some(r =>
    (r.status || '').trim().toLowerCase() === 'approved'
  );

  // ❌ already approved → block submit
  if (hasApproved) return false;

  const pending = resignations.find(r =>
    (r.status || '').trim().toLowerCase() === 'pending'
  );

  // ⛔ if pending resignation exists and LWD not passed → block
  if (pending?.lastWorkingDay) {
    const lastDay = new Date(pending.lastWorkingDay);
    lastDay.setHours(0, 0, 0, 0);

    if (today <= lastDay) {
      return false;
    }
  }

  // ✅ otherwise allow
  return true;
}

  saveResignation(form: NgForm) {

  this.formSubmitted = true;
  this.message = '';

  Object.values(form.controls).forEach(control => {
    control.markAsTouched();
    control.updateValueAndValidity();
  });

  if (!this.isEditMode && !this.canSubmitResignation()) {

    const hasApproved = this.resignations.some(r =>
      r.status?.trim().toLowerCase() === 'approved'
    );

    if (hasApproved) {
      this.message =
        'You already have an approved resignation. Cannot create new record.';
    } else {
      this.message =
        'You have a pending resignation. You can apply again only after your last working day is completed.';
    }

    return;
  }

  if (
    !this.resignationModel.resignationReason ||
    this.resignationModel.resignationReason.trim().length < 10 ||
    form.invalid ||
    this.dateError
  ) {
    return;
  }

  if (
    this.isEditMode &&
    this.resignationModel.status?.trim().toLowerCase() === 'approved'
  ) {
    this.message = 'Approved resignations cannot be updated.';
    return;
  }

  // ✅ ALWAYS SET USER DETAILS BEFORE SAVE

  if (this.isHR) {

    const emp = this.employees.find(
      x => x.employeeCode == this.selectedEmployeeId
    );

    if (!emp) {
      this.message = 'Please select an employee';
      return;
    }

    this.resignationModel.userId = emp.userId;
    this.resignationModel.employeeId = emp.employeeCode;

  } else {

    this.resignationModel.userId =
      Number(sessionStorage.getItem('UserId'));

    this.resignationModel.employeeId =
      sessionStorage.getItem('EmployeeCode') || '';
  }

  // ✅ COMPANY / REGION

  this.resignationModel.companyId = this.companyId;
  this.resignationModel.regionId = this.regionId;

  console.log('Submitting Resignation => ', this.resignationModel);

  const apiCall =
    this.isEditMode && this.resignationModel.resignationId
      ? this.resignationService.update(
          this.resignationModel.resignationId,
          this.resignationModel
        )
      : this.resignationService.create(this.resignationModel);

  apiCall.subscribe({
    next: () => {

  const actionType =
    this.resignationModel.resignationType || 'Request';

      Swal.fire({
        icon: 'success',
        title: this.isEditMode ? 'Updated Successfully' : 'Submitted Successfully',
        text: this.isEditMode
          ? `${actionType} request updated successfully.`
          : `${actionType} request submitted successfully.`,
        confirmButtonText: 'OK'
      });

  this.resetForm(form);
  this.loadResignations();
},
    error: (err) => {

      console.error('Error saving resignation:', err);

      this.message =
        err.error?.message ||
        'Resignation already exists for selected Last Working Day';
    }
  });
}

  editResignation(item: EmployeeResignation) {
    if (!this.isEditable(item)) {
      this.message = 'Approved resignations cannot be edited.';
      return;
    }

    this.resignationModel = { ...item };
    this.isEditMode = true;
  }

  isEditable(item: EmployeeResignation): boolean {
    return item.status?.trim().toLowerCase() !== 'approved';
  }

  isDeletable(item: EmployeeResignation): boolean {
    return this.isEditable(item);
  }

  // ---------------- DELETE FIXED ----------------
loadForManager() {
  const managerUserId = Number(sessionStorage.getItem('UserId'));
  this.resignationService
    .getResignationsForManager(managerUserId) // ✅ pass companyId, regionId
    .subscribe((res: EmployeeResignation[]) => {
      this.filteredResignations = res;
    });
}
deleteResignation(item: EmployeeResignation) {
  if (!this.isDeletable(item)) {
    this.message = 'Approved resignations cannot be deleted.';
    return;
  }

  if (confirm('Are you sure you want to delete this resignation?')) {
    this.resignationService
      .delete(item.resignationId!, this.companyId, this.regionId, this.roleId) // pass all 4 args
      .subscribe({
        next: () => {
          this.message = 'Resignation deleted successfully!';
          this.loadResignations();
        },
        error: (err) => (this.message = 'Failed to delete resignation: ' + err.message),
      });
  }
}


  resetForm(form: NgForm) {
    form.resetForm();
    this.resignationModel = { resignationType: '' , hrEmail: '' };
    this.isEditMode = false;
    this.dateError = '';
    this.formSubmitted = false;
  }
}
