import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { EarlyLogoutService } from './service/early-logout.service';

@Component({
  selector: 'app-early-logout-request',
  standalone: false,
  templateUrl: './early-logout-request.component.html',
  styleUrl: './early-logout-request.component.css'
})
export class EarlyLogoutRequestComponent implements OnInit {
  earlyLogoutForm!: FormGroup;
  isEditMode = false;
  editId: number | null = null;

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
pagedMyRequests: any[] = [];
pagedCombinedRequests: any[] = [];
  selectedTab = '';
  canViewPersonal = false;
  canViewManager = false;
  canViewHR = false;
  isHR = false;

  companyId = Number(sessionStorage.getItem('CompanyId')) || 1;
  regionId = Number(sessionStorage.getItem('RegionId')) || 1;
  userId = Number(sessionStorage.getItem('UserId')) || 1;
  managerId = Number(sessionStorage.getItem('UserId')) || 0;

  constructor(
    private fb: FormBuilder,
    private earlyLogoutService: EarlyLogoutService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadMyRequests();
    this.loadApprovalRequests();
    this.loadPermissions();
  }

  initializeForm(): void {
    this.earlyLogoutForm = this.fb.group({
      requestDate: [null, Validators.required],
      requestedLogoutTime: [null, Validators.required],
      reason: [null, Validators.required],
      hrEmail: [null]
    });
  }

  submitEarlyLogout(): void {
    if (this.earlyLogoutForm.invalid) {
      this.earlyLogoutForm.markAllAsTouched();
      return;
    }

   const payload = {
  EarlyLogoutRequestID: this.editId,
   reportingTo: this.managerId,
   employeeID: this.userId,
  requestDate: this.earlyLogoutForm.value.requestDate,
  requestedLogoutTime: this.earlyLogoutForm.value.requestedLogoutTime,
  reason: this.earlyLogoutForm.value.reason,
  hrEmail: this.earlyLogoutForm.value.hrEmail,
  companyID: this.companyId,
  regionID: this.regionId,
  userId: this.userId
};

    const request$ = this.isEditMode && this.editId
      ? this.earlyLogoutService.updateEarlyLogout(payload)
      : this.earlyLogoutService.createEarlyLogoutRequest(payload);

    request$.subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: this.isEditMode ? 'Updated!' : 'Submitted!',
          text: this.isEditMode
            ? 'Early logout request updated successfully'
            : 'Early logout request submitted successfully',
          timer: 2000,
          showConfirmButton: false
        });

        if (!this.isEditMode) {
          const newRecord = {
            ...payload,
            status: 'Pending',
            managerRemarks: '',
            employeeName: sessionStorage.getItem('Name') || 'You'
          };

          this.myRequests = [newRecord, ...this.myRequests];
        }

        this.resetForm();
        this.loadMyRequests();
        this.cdr.detectChanges();
      },
     error: (err) => {
  console.log('FULL ERROR => ', err);
  console.log('ERROR BODY => ', err.error);

  Swal.fire(
    'Warning',
    err.error?.message ||
    err.error ||
    err.message ||
    'Something went wrong',
    'warning'
  );
}

    });
  }

  editEarlyLogout(item: any): void {
    this.isEditMode = true;
    this.editId = item.earlyLogoutRequestId || item.earlyLogoutRequestID;

    this.earlyLogoutForm.patchValue({
      requestDate: item.requestDate,
      requestedLogoutTime: item.requestedLogoutTime,
      reason: item.reason,
      hrEmail: item.hrEmail
    });
  }

  resetForm(): void {
    this.earlyLogoutForm.reset();
    this.isEditMode = false;
    this.editId = null;
  }

  private normalizeList(res: any): any[] {
    if (Array.isArray(res)) {
      return res;
    }

    if (!res || typeof res !== 'object') {
      return [];
    }

    const keys = ['data', 'result', 'records', 'items', 'response'];
    for (const key of keys) {
      const value = res[key];
      if (Array.isArray(value)) {
        return value;
      }
    }

    for (const value of Object.values(res)) {
      if (Array.isArray(value)) {
        return value;
      }
    }

    return [];
  }

  loadMyRequests(): void {
    this.earlyLogoutService
      .getEarlyLogoutRequest(this.companyId, this.regionId, this.userId)
      .subscribe((res: any) => {
        this.myRequests = this.normalizeList(res);
         this.currentPage = 1;
      this.updatePagination();
        this.cdr.detectChanges();

        
      });
  }

  loadApprovalRequests(): void {
    this.earlyLogoutService
      .getApprovalEarlyLogoutRequest(this.companyId, this.regionId, this.managerId)
      .subscribe((res: any) => {
        const list = this.normalizeList(res);
        this.hrRequests = list;
        this.pendingRequests = list.filter((x: any) => (x.status || '').trim() === 'Pending');
        this.approvedRequests = list.filter((x: any) => (x.status || '').trim() === 'Approved');
        this.rejectedRequests = list.filter((x: any) => (x.status || '').trim() === 'Rejected');

        this.pendingRequests = this.pendingRequests.map((x: any) => ({
          ...x,
          selected: false,
          managerRemarks: x.managerRemarks || ''
        }));
        this.currentPage = 1;
        this.updatePagination();
        this.cdr.detectChanges();
      });
  }

  approve(item: any): void {
    debugger;
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to approve this request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          earlyLogoutRequestIds: [item.earlyLogoutRequestId || item.earlyLogoutRequestID],
          status: 'Approved',
          managerRemarks: item.managerRemarks,
          managerId: this.managerId,
          companyId: this.companyId,
          regionId: this.regionId,
          hrEmail: item.hrEmail
        };

        this.earlyLogoutService.bulkApproveRejectEarlyLogout(payload).subscribe({
            
          next: () => {
            debugger;
            Swal.fire({
              icon: 'success',
              title: 'Approved!',
              text: 'Request approved successfully',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadApprovalRequests();
          }
        });
      }
    });
  }

  reject(item: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to reject this request?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reject'
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          earlyLogoutRequestIds: [item.earlyLogoutRequestId || item.earlyLogoutRequestID],
          status: 'Rejected',
          managerRemarks: item.managerRemarks,
          managerId: this.managerId,
          companyId: this.companyId,
          regionId: this.regionId,
          hrEmail: item.hrEmail
        };

        this.earlyLogoutService.bulkApproveRejectEarlyLogout(payload).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Rejected!',
              text: 'Request rejected successfully',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadApprovalRequests();
          }
        });
      }
    });
  }

  bulkApproveReject(status: 'Approved' | 'Rejected'): void {
    const selectedIds = this.pendingRequests
      .filter((x: any) => x.selected)
      .map((x: any) => x.earlyLogoutRequestId || x.earlyLogoutRequestID);

    if (selectedIds.length === 0) {
      Swal.fire('Warning', 'Please select at least one record', 'warning');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to ${status.toLowerCase()} selected requests?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${status}`
    }).then((result) => {
      if (result.isConfirmed) {
        const payload = {
          earlyLogoutRequestIds: selectedIds,
          status,
          managerRemarks: '',
          managerId: this.managerId,
          companyId: this.companyId,
          regionId: this.regionId,
          hrEmail: this.pendingRequests.find((x: any) => x.selected)?.hrEmail
        };

        this.earlyLogoutService.bulkApproveRejectEarlyLogout(payload).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: `${status}!`,
              text: `Selected requests ${status.toLowerCase()} successfully`,
              timer: 2000,
              showConfirmButton: false
            });
            this.loadApprovalRequests();
          }
        });
      }
    });
  }

  selectAll(event: any): void {
    const checked = event.target.checked;
    this.pendingRequests.forEach((x: any) => x.selected = checked);
  }

  get combinedRequests(): any[] {
    if (this.hrRequests.length) {
      return this.hrRequests;
    }

    return [...this.pendingRequests, ...this.approvedRequests, ...this.rejectedRequests];
  }

  loadPermissions(): void {
    const menus = JSON.parse(sessionStorage.getItem('Menus') || '[]');
    const roleName = (sessionStorage.getItem('roleName') || '').trim().toLowerCase();
    const designationName = (sessionStorage.getItem('DesignationName') || '').trim().toLowerCase();

    this.isHR =
      roleName.includes('hr') ||
      roleName.includes('human') ||
      designationName.includes('hr') ||
      designationName.includes('human');

    const isManagerRole =
      roleName.includes('manager') ||
      designationName.includes('manager');

    const personal = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'my request'
    );

    const managerapproval = menus.find((m: any) =>
      m.menuName?.trim().toLowerCase() === 'manager approval'
    );

    const hrMenu = menus.find((m: any) =>
      ['hr', 'hr approval', 'hr view', 'hr management'].includes(
        (m.menuName?.trim().toLowerCase() || '')
      )
    );

    this.canViewPersonal = personal?.canView ?? false;
    this.canViewManager = (managerapproval?.canView ?? false) || isManagerRole;
    this.canViewHR = (hrMenu?.canView ?? false) || this.isHR;

    // Force the combined section to be visible whenever either HR or Manager access exists.
    const showCombined = this.canViewHR || this.canViewManager;

    if (showCombined) {
      this.selectedTab = 'tab3';
    } else if (this.canViewPersonal) {
      this.selectedTab = 'tab1';
    }
  }

updatePagination(): void {
  this.totalRecords = this.combinedRequests.length;
  this.totalPages = Math.ceil(this.totalRecords / this.pageSize);

  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;

  this.pagedCombinedRequests =
    this.combinedRequests.slice(start, end);
}


changePage(page: number): void {
  if (page < 1 || page > this.totalPages) {
    return;
  }

  this.currentPage = page;
  this.updatePagination();
}

changePageSize(size: number): void {
  this.pageSize = size;
  this.currentPage = 1;
  this.updatePagination();
}
}
