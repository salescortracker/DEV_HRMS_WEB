import { Component } from '@angular/core';
import { RecruitmentService } from '../service/recruitment.service';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-documents-verification',
  standalone: false,
  templateUrl: './documents-verification.component.html',
  styleUrl: './documents-verification.component.css'
})
export class DocumentsVerificationComponent {
documents: any[] = [];
companyId!: number;
regionId!: number;
documentsList = [
  { key: 'aadharCard', label: 'Aadhar', icon: '🪪' },
  { key: 'panCard', label: 'PAN', icon: '🧾' },
  { key: 'passport', label: 'Passport', icon: '🛂' },
  { key: 'offerLetter', label: 'Offer', icon: '📄' },
  { key: 'experienceLetter', label: 'Experience', icon: '📑' },
  { key: 'relievingLetter', label: 'Relieving', icon: '📃' },
  { key: 'hikeLetter', label: 'Hike', icon: '📈' },
  { key: 'idProof', label: 'ID', icon: '🆔' }
];

statusOptions = ['Link Sent', 'Submitted', 'Verified', 'Rejected'];
constructor(private recruitmentService: RecruitmentService) {}
ngOnInit(): void {

  this.companyId = Number(sessionStorage.getItem("CompanyId"));
  this.regionId = Number(sessionStorage.getItem("RegionId"));

  console.log('CompanyId:', this.companyId);
  console.log('RegionId:', this.regionId);

  if (!this.companyId || !this.regionId) {
    console.error("❌ CompanyId or RegionId missing in sessionStorage");
    return;
  }

  this.loadData();
}
getFileUrl(filePath: string): string {

  if (!filePath) return '';

  return `${environment.baseurl}/${filePath.replace(/ /g, '%20')}`;
}
downloadFile(fileName: string) {

  if (!fileName) return;

  const fileUrl = this.getFileUrl(fileName);

  fetch(fileUrl)
    .then(response => response.blob())
    .then(blob => {

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement('a');

      link.href = blobUrl;

      link.download = fileName;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    })
    .catch(err => {
      console.error('Download failed', err);
    });
}
loadData() {
  this.recruitmentService
    .getAllCandidateDocuments(this.companyId, this.regionId)
    .subscribe({
      next: (res: any) => {
        this.documents = res;
      },
      error: (err) => {
        console.error('API Error:', err);
      }
    });
}
updateStatus(row: any) {

  this.recruitmentService.updateChecklistStatus(
    row.offerId,
    this.companyId,
    this.regionId,
    row.status
  ).subscribe({
    next: () => {

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Status Updated Successfully',
        timer: 2000,
        showConfirmButton: false
      });

      this.loadData();
    },
    error: (err) => {

      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Status update failed'
      });

      console.error(err);
    }
  });
}
}

