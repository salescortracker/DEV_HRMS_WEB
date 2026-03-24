import { Component } from '@angular/core';
import { AttendanceService,CreateWorkFromHomeRequest,UpdateWorkFromHomeRequest,BulkApproveRejectWorkFromHome } from '../service/attendance.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-wfo-remote-request',
  standalone: false,
  templateUrl: './wfo-remote-request.component.html',
  styleUrl: './wfo-remote-request.component.css'
})
export class WfoRemoteRequestComponent {
 /* ========= SESSION DATA ========= */
  userId = Number(sessionStorage.getItem('UserId'));
  employeeName = sessionStorage.getItem('Name') || '';
  companyId = Number(sessionStorage.getItem('CompanyId'));
  regionId = Number(sessionStorage.getItem('RegionId'));
  managerId = Number(sessionStorage.getItem('reportingManagerId'));
  /* ========= FORM MODEL ========= */
  wfhForm: CreateWorkFromHomeRequest = {
    employeeID: this.userId,
    employeeName: this.employeeName,
    fromDate: '',
    toDate: '',
    requestType: '',
    reason: '',
    managerID: this.managerId,
    companyID: this.companyId,
    regionID: this.regionId,
    userId: this.userId
  };

  /* ========= LISTS ========= */
  myRequests: any[] = [];
  approvalRequests: any[] = [];

  /* ========= MANAGER ========= */
  selectAll = false;
  managerRemarks = '';

  constructor(private attendanceService: AttendanceService) {}

  ngOnInit(): void {
    this.loadMyRequests();
    this.loadApprovalRequests();
  }

  /* ================= SUBMIT REQUEST ================= */

  submitWfhRequest(): void {
    debugger;
    this.attendanceService.createRequest(this.wfhForm).subscribe({
      next: () => {
        Swal.fire('Created','WFH request submitted successfully','success');
        this.resetForm();
        this.loadMyRequests();
      },
      error: err => console.error(err)
    });
  }

  resetForm(): void {
    this.wfhForm.fromDate = '';
    this.wfhForm.toDate = '';
    this.wfhForm.requestType = '';
    this.wfhForm.reason = '';
  }

  /* ================= MY REQUESTS ================= */

  loadMyRequests(): void {
    this.attendanceService
      .getMyRequests(this.userId, this.companyId, this.regionId)
      .subscribe(res => this.myRequests = res);
  }

  /* ================= MANAGER APPROVAL ================= */

  loadApprovalRequests(): void {
    this.attendanceService
      .getPendingApprovals(this.companyId, this.userId, this.regionId)
      .subscribe(res => {
        this.approvalRequests = res.map(x => ({
          ...x,
          selected: false
        }));
        this.selectAll = false;
      });
  }

  toggleSelectAll(): void {
    this.approvalRequests.forEach(x => x.selected = this.selectAll);
  }

  updateSelectAll(): void {
    this.selectAll = this.approvalRequests.every(x => x.selected);
  }

  getSelectedIds(): number[] {
    return this.approvalRequests
      .filter(x => x.selected)
      .map(x => x.wfhrequestId);
  }

  bulkAction(status: 'Approved' | 'Rejected'): void {
    debugger;
    const ids = this.getSelectedIds();

    if (ids.length === 0) {
      alert('Please select at least one request');
      return;
    }

    const payload: BulkApproveRejectWorkFromHome = {
      wfhRequestIDs: ids,
      status,
      managerRemarks: this.managerRemarks,
      managerID: this.userId,
      companyID: this.companyId
    };

    this.attendanceService.bulkApproveReject(payload).subscribe({
      next: () => {
        Swal.fire("Approved",`${status} successfully`,'success');
        this.managerRemarks = '';
        this.loadApprovalRequests();
      },
      error: err => console.error(err)
    });
  }
}
