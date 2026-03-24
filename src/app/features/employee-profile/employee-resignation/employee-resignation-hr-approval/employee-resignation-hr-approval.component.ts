import { Component } from '@angular/core';
import { EmployeeResignation } from '../../employee-models/EmployeeResignation';
import Swal from 'sweetalert2';
import { EmployeeResignationService } from '../../employee-services/employee-resignation.service';
@Component({
  selector: 'app-employee-resignation-hr-approval',
  standalone: false,
  templateUrl: './employee-resignation-hr-approval.component.html',
  styleUrl: './employee-resignation-hr-approval.component.css'
})
export class EmployeeResignationHrApprovalComponent {
  filteredResignations: any[] = [];

  constructor(private resignationService: EmployeeResignationService) {}

  ngOnInit(): void {
    this.loadResignations();
  }

  loadResignations(): void {
    this.resignationService.getResignationsForHR().subscribe({
      next: res => {
        this.filteredResignations = res || [];
      },
      error: () => {
        Swal.fire('Error', 'Failed to load resignations', 'error');
      }
    });
  }

  approveByHR(item: any): void {
    if (!item.hrReason || item.hrReason.trim() === '') {
      Swal.fire('Required', 'Please enter HR comments', 'info');
      return;
    }

    Swal.fire({
      title: 'Approve resignation?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve'
    }).then(result => {
      if (result.isConfirmed) {
        this.updateStatus(item, 'HR Approved', true, false);
      }
    });
  }

  rejectByHR(item: any): void {
    if (!item.hrReason || item.hrReason.trim() === '') {
      Swal.fire('Required', 'Please enter HR comments', 'info');
      return;
    }

    Swal.fire({
      title: 'Reject resignation?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reject'
    }).then(result => {
      if (result.isConfirmed) {
        this.updateStatus(item, 'HR Rejected', false, true);
      }
    });
  }

  private updateStatus(item: any, status: string, approve: boolean, reject: boolean): void {
    this.resignationService.updateStatus({
      resignationId: item.resignationId,
      status: status,
      hrReason: item.hrReason,
      isHRApprove: approve,
      isHRReject: reject,
      isManagerApprove: false,
      isManagerReject: false
    }).subscribe({
      next: () => {
        item.status = status;

        Swal.fire(
          approve ? 'Approved!' : 'Rejected!',
          `Resignation ${status.toLowerCase()} successfully.`,
          'success'
        );
      },
      error: () => {
        Swal.fire('Error', 'Failed to update resignation', 'error');
      }
    });
  }
}
