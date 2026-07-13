import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { EarlyLogoutService } from '../early-logout-request/service/early-logout.service';
@Component({
  selector: 'app-late-arrivals',
  standalone: false,
  templateUrl: './late-arrivals.component.html',
  styleUrl: './late-arrivals.component.css'
})
export class LateArrivalsComponent implements OnInit {
   selectedTab = '';
  isHR = false;

  earlyLogoutForm!: FormGroup;

  isEditMode = false;
  editId: number | null = null;

  canViewPersonal = false;
  canViewManager = false;
  canViewHR = false;

  canCreateMyRequest = false;
  canEditMyRequest = false;

  myRequests: any[] = [];
  pendingRequests: any[] = [];
  approvedRequests: any[] = [];
  rejectedRequests: any[] = [];
  hrRequests: any[] = [];

  currentPage = 1;
  pageSize = 5;
  pageSizeOptions = [5, 10, 25, 50];
  totalRecords = 0;
  totalPages = 0;
  pagedCombinedRequests: any[] = [];

  myCurrentPage = 1;
  myPageSize = 5;
  myTotalPages = 1;
  pagedMyRequests: any[] = [];

  pendingCurrentPage = 1;
  approvedCurrentPage = 1;
  rejectedCurrentPage = 1;
  managerPageSize = 5;
  pendingTotalPages = 1;
  approvedTotalPages = 1;
  rejectedTotalPages = 1;
  pagedPendingRequests: any[] = [];
  pagedApprovedRequests: any[] = [];
  pagedRejectedRequests: any[] = [];

  companyId = Number(sessionStorage.getItem('CompanyId'));
  regionId = Number(sessionStorage.getItem('RegionId'));
  userId = Number(sessionStorage.getItem('UserId'));
  

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private earlyLogoutService: EarlyLogoutService
  ) { }

  ngOnInit(): void {
console.log("CompanyId:", this.companyId);
console.log("RegionId:", this.regionId);
console.log("UserId:", this.userId);
console.log("ReportingTo:", sessionStorage.getItem("ReportingTo"));
console.log("ManagerId:", this.userId);
console.log("ReportingTo:", sessionStorage.getItem("ReportingTo"));
console.log("managerId:", this.userId);
    this.initializeForm();

    this.loadPermissions();

    if (this.canViewPersonal)
      this.selectedTab = 'tab1';
    else if (this.canViewManager)
      this.selectedTab = 'tab2';
    else if (this.canViewHR)
      this.selectedTab = 'tab3';

    this.loadMyRequests();
    this.loadPendingRequests();

  }

  initializeForm(): void {

    this.earlyLogoutForm = this.fb.group({
      requestDate: [null, Validators.required],
      requestedLateLoginTime: [null, Validators.required],
      reason: ['', Validators.required],
      hrEmail: ['']
    });

  }

  submitEarlyLogout(): void {

    if (this.earlyLogoutForm.invalid) {

      this.earlyLogoutForm.markAllAsTouched();
      return;

    }

    if (!this.isEditMode) {

      const payload = {

        companyID: this.companyId,
        regionID: this.regionId,
        userId: this.userId,

        requestDate: this.earlyLogoutForm.value.requestDate,
        requestedLateLoginTime:
          this.earlyLogoutForm.value.requestedLateLoginTime,

        reason: this.earlyLogoutForm.value.reason,
        hrEmail: this.earlyLogoutForm.value.hrEmail

      };

      this.earlyLogoutService
        .createLateArrivalRequest(payload)
        .subscribe({

          next: (res: any) => {

            Swal.fire(
              'Success',
              res.message,
              'success'
            );

            this.resetForm();

            this.loadMyRequests();

            this.loadPendingRequests();

          },

          error: (err : any) => {

            Swal.fire(
              'Error',
              err.error?.message || 'Something went wrong',
              'error'
            );

          }

        });

    }

    else {

      const payload = {

        lateArrivalRequestID: this.editId,

        companyID: this.companyId,

        regionID: this.regionId,

        requestDate: this.earlyLogoutForm.value.requestDate,

        requestedLateLoginTime:
          this.earlyLogoutForm.value.requestedLateLoginTime,

        reason: this.earlyLogoutForm.value.reason,

        hrEmail: this.earlyLogoutForm.value.hrEmail

      };

      this.earlyLogoutService
        .updateLateArrival(payload)
        .subscribe({

          next: (res: any) => {

            Swal.fire(
              'Success',
              res.message,
              'success'
            );

            this.resetForm();

            this.loadMyRequests();

          },

          error: (err : any) => {

            Swal.fire(
              'Error',
              err.error?.message || 'Update Failed',
              'error'
            );

          }

        });

    }

  }

  editEarlyLogout(item: any): void {

    this.isEditMode = true;

    this.editId = item.lateLoginId;

    this.earlyLogoutForm.patchValue({

      requestDate: item.requestDate,

      requestedLateLoginTime:
        item.requestedLateLoginTime,

      reason: item.reason,

      hrEmail: item.hrEmail

    });

  }

  resetForm(): void {

    this.earlyLogoutForm.reset();

    this.isEditMode = false;

    this.editId = null;

  }

  loadPermissions(): void {

    const menus = JSON.parse(sessionStorage.getItem('Menus') || '[]');

    const roleName =
      (sessionStorage.getItem('roleName') || '')
        .toLowerCase();

    const designationName =
      (sessionStorage.getItem('DesignationName') || '')
        .toLowerCase();

    this.isHR =
      roleName.includes('hr') ||
      designationName.includes('hr');

    const personals = menus.find(
      (m: any) =>
        m.menuName?.toLowerCase() === 'my request'
    );

    const manager = menus.find(
      (m: any) =>
        m.menuName?.toLowerCase() === 'manager approval'
    );

    const hr = menus.find(
      (m: any) =>
        m.menuName?.toLowerCase() === 'hr and manager'
    );

    this.canViewPersonal = personals?.canView ?? false;
    this.canCreateMyRequest = personals?.canAdd ?? false;
    this.canEditMyRequest = personals?.canEdit ?? false;

    this.canViewManager = manager?.canView ?? false;

    this.canViewHR = hr?.canView ?? false;
  }
    loadMyRequests(): void {

    this.earlyLogoutService
      .getLateArrivalRequest(
        this.companyId,
        this.regionId,
        this.userId
      )
      .subscribe({

        next: (res: any) => {

          this.myRequests = res;
          this.myCurrentPage = 1;
          this.updateMyPagination();

        },

        error: (err : any) => {

          console.log(err);

        }

      });

  }

  loadPendingRequests(): void {

    this.earlyLogoutService
      .getApprovalLateArrivalRequest(
        this.companyId,
        this.regionId,
        this.userId
      )
      .subscribe({

        next: (res: any[]) => {

          this.pendingRequests =
            res.filter(x => x.status === 'Pending');

          this.approvedRequests =
            res.filter(x => x.status === 'Approved');

          this.rejectedRequests =
            res.filter(x => x.status === 'Rejected');

          this.hrRequests = res;

          this.pendingCurrentPage = 1;
          this.approvedCurrentPage = 1;
          this.rejectedCurrentPage = 1;
          this.updateManagerPagination();
          this.updatePagination();

        },

        error: (err : any) => {

          console.log(err);

        }

      });

  }

  get combinedRequests(): any[] {

    if (this.hrRequests.length > 0)
      return this.hrRequests;

    return [
      ...this.pendingRequests,
      ...this.approvedRequests,
      ...this.rejectedRequests
    ];

  }
  

  updatePagination(): void {

    this.totalRecords = this.combinedRequests.length;

    this.totalPages = Math.max(
      1,
      Math.ceil(this.totalRecords / this.pageSize)
    );

    const start = (this.currentPage - 1) * this.pageSize;

    const end = start + this.pageSize;

    this.pagedCombinedRequests =
      this.combinedRequests.slice(start, end);

  }

  updateMyPagination(): void {
    const totalRecords = this.myRequests.length;
    this.myTotalPages = Math.max(1, Math.ceil(totalRecords / this.myPageSize));
    const start = (this.myCurrentPage - 1) * this.myPageSize;
    this.pagedMyRequests = this.myRequests.slice(start, start + this.myPageSize);
  }

  updateManagerPagination(): void {
    this.pendingTotalPages = Math.max(1, Math.ceil(this.pendingRequests.length / this.managerPageSize));
    this.approvedTotalPages = Math.max(1, Math.ceil(this.approvedRequests.length / this.managerPageSize));
    this.rejectedTotalPages = Math.max(1, Math.ceil(this.rejectedRequests.length / this.managerPageSize));

    const pendingStart = (this.pendingCurrentPage - 1) * this.managerPageSize;
    const approvedStart = (this.approvedCurrentPage - 1) * this.managerPageSize;
    const rejectedStart = (this.rejectedCurrentPage - 1) * this.managerPageSize;

    this.pagedPendingRequests = this.pendingRequests.slice(pendingStart, pendingStart + this.managerPageSize);
    this.pagedApprovedRequests = this.approvedRequests.slice(approvedStart, approvedStart + this.managerPageSize);
    this.pagedRejectedRequests = this.rejectedRequests.slice(rejectedStart, rejectedStart + this.managerPageSize);
  }

  changePage(page: number): void {

    if (page < 1 || page > this.totalPages)
      return;

    this.currentPage = page;

    this.updatePagination();

  }

  changePageSize(size: number): void {

    this.pageSize = size;

    this.currentPage = 1;

    this.updatePagination();

  }

  changeMyPage(page: number): void {
    if (page < 1 || page > this.myTotalPages)
      return;

    this.myCurrentPage = page;
    this.updateMyPagination();
  }

  changeMyPageSize(size: number): void {
    this.myPageSize = size;
    this.myCurrentPage = 1;
    this.updateMyPagination();
  }

  changePendingPage(page: number): void {
    if (page < 1 || page > this.pendingTotalPages)
      return;

    this.pendingCurrentPage = page;
    this.updateManagerPagination();
  }

  changeApprovedPage(page: number): void {
    if (page < 1 || page > this.approvedTotalPages)
      return;

    this.approvedCurrentPage = page;
    this.updateManagerPagination();
  }

  changeRejectedPage(page: number): void {
    if (page < 1 || page > this.rejectedTotalPages)
      return;

    this.rejectedCurrentPage = page;
    this.updateManagerPagination();
  }

  changeManagerPageSize(size: number): void {
    this.managerPageSize = size;
    this.pendingCurrentPage = 1;
    this.approvedCurrentPage = 1;
    this.rejectedCurrentPage = 1;
    this.updateManagerPagination();
  }

  selectAll(event: any): void {

    const checked = event.target.checked;

    this.pendingRequests.forEach(x => {

      x.selected = checked;

    });

  }

  bulkApproveReject(status: 'Approved' | 'Rejected'): void {

    const selected =
      this.pendingRequests.filter(x => x.selected);

    if (selected.length === 0) {

      Swal.fire(
        'Warning',
        'Please select at least one request.',
        'warning'
      );

      return;

    }

    Swal.fire({

      title: 'Confirmation',

      text: `Do you want to ${status} selected request(s)?`,

      icon: 'question',

      showCancelButton: true,

      confirmButtonText: 'Yes'

    }).then(result => {

      if (!result.isConfirmed)
        return;

      const payload = {

        lateArrivalRequestIds:
          selected.map(x => x.lateArrivalRequestId),

        managerID: this.userId,

        status: status,

        managerRemarks:
          selected[0].managerRemarks ?? ''

      };

      this.earlyLogoutService
        .bulkApproveRejectLateArrival(payload)
        .subscribe({

          next: (res: any) => {

            Swal.fire(
              'Success',
              res.message,
              'success'
            );

            this.loadPendingRequests();

          },

          error: (err : any) => {

            Swal.fire(
              'Error',
              err.error?.message || 'Operation Failed',
              'error'
            );

          }

        });

    });

  }


}
