import { Component, OnInit } from '@angular/core';
import { EmployeeResignation } from '../../employee-models/EmployeeResignation';
import { EmployeeResignationService } from '../../employee-services/employee-resignation.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employee-resignation-manager-approval',
  standalone: false,
  templateUrl: './employee-resignation-manager-approval.component.html',
  styleUrl: './employee-resignation-manager-approval.component.css'
})
export class EmployeeResignationManagerApprovalComponent {
 filteredResignations: EmployeeResignation[] = [];

  managerUserId = Number(sessionStorage.getItem('UserId'));
  companyId = Number(sessionStorage.getItem('CompanyId'));
  regionId = Number(sessionStorage.getItem('RegionId'));

  selectAll = false;


  constructor(private resignationService: EmployeeResignationService) {}

  ngOnInit(): void {
    this.loadForManager();
  }

 

loadForManager(): void {
  console.log('ManagerUserId:', this.managerUserId);

  this.resignationService
    .getResignationsForManager(this.managerUserId) // ✅ ONLY USERID
    .subscribe(res => {

      console.log('API Response:', res);

      this.filteredResignations = res;
      this.updateSelectAllState();
    });
}
  // ✅ CHECK IF ANY PENDING RECORD EXISTS
  hasPendingResignations(): boolean {
    return this.filteredResignations.some(r => r.status === 'Pending');
  }

  // ✅ SELECT / DESELECT ONLY PENDING ROWS
  toggleSelectAll(): void {
    this.filteredResignations.forEach(res => {
      if (res.status === 'Pending') {
        res.approveChecked = this.selectAll;
      }
    });
  }

  // ✅ KEEP HEADER CHECKBOX IN SYNC
  updateSelectAllState(): void {
    const pending = this.filteredResignations.filter(r => r.status === 'Pending');
    this.selectAll =
      pending.length > 0 && pending.every(r => r.approveChecked === true);
  }

  approveResignation(res: EmployeeResignation): void {

  const actionType = res.resignationType || 'Request';

  Swal.fire({
    title: `Approve ${actionType}?`,
    text: `Are you sure you want to approve this ${actionType.toLowerCase()} request?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Approve'
  }).then(result => {

    if (result.isConfirmed) {

      this.resignationService.updateStatus({
        resignationId: res.resignationId!,
        status: 'Approved',
        managerReason: res.managerReason,
        isManagerApprove: true,
        isManagerReject: false
      }).subscribe(() => {

        res.status = 'Approved';
        res.approveChecked = false;

        Swal.fire(
          'Approved!',
          `${actionType} approved successfully.`,
          'success'
        );
      });
    }
  });
}

  rejectResignation(res: EmployeeResignation): void {

  const actionType = res.resignationType || 'Request';

  if (!res.managerReason || res.managerReason.trim() === '') {
    Swal.fire(
      'Required',
      'Please enter manager comments before rejecting.',
      'info'
    );
    return;
  }

  Swal.fire({
    title: `Reject ${actionType}?`,
    text: `Are you sure you want to reject this ${actionType.toLowerCase()} request?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, Reject'
  }).then(result => {

    if (result.isConfirmed) {

      this.resignationService.updateStatus({
        resignationId: res.resignationId!,
        status: 'Rejected',
        managerReason: res.managerReason,
        isManagerApprove: false,
        isManagerReject: true
      }).subscribe(() => {

        res.status = 'Rejected';
        res.approveChecked = false;

        this.updateSelectAllState();

        Swal.fire(
          'Rejected!',
          `${actionType} rejected successfully.`,
          'success'
        );
      });
    }
  });
}
}
