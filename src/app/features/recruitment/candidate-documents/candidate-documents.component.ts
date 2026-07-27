import { Component, OnInit } from '@angular/core';
import { RecruitmentService } from '../service/recruitment.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-candidate-documents',
  standalone: false,
  templateUrl: './candidate-documents.component.html',
  styleUrl: './candidate-documents.component.css'
})
export class CandidateDocumentsComponent implements OnInit  {
  token!: string;

  candidateName = '';
  designation = '';

  offerId!: number;
  candidateId!: number;
  companyId!: number;
  regionId!: number;

  files: any = {};
  constructor(private route: ActivatedRoute, private recruitmentService: RecruitmentService) {}
  ngOnInit(): void {

  this.route.params.subscribe(params => {

  this.companyId = Number(params['companyId']);
  this.regionId = Number(params['branchId']);
  this.candidateId = Number(params['employeeId']);
  this.offerId = Number(params['offerId']);

  console.log({
    companyId: this.companyId,
    branchId: this.regionId,
    employeeId: this.candidateId,
    offerId: this.offerId
  });

  if(this.offerId){
    this.loadOfferData();
  }

});

}

  loadOfferData() {

    this.recruitmentService
      .getOfferById(this.offerId)
      .subscribe({

        next: (res: any) => {

          console.log('Offer Data:', res);

          this.offerId = res.offerId;
          this.candidateId = res.candidateId;
          this.companyId = res.companyId;
          this.regionId = res.regionId;

          this.candidateName = res.candidateName;
          this.designation = res.designation;
        },

        error: (err) => {

          console.log(err);

          Swal.fire(
            'Error',
            'Invalid Offer',
            'error'
          );
        }

      });

  }

  onFileChange(event: any, field: string) {
    if (event.target.files.length > 0) {
      this.files[field] = event.target.files[0];
    }
  }

  submitDocuments() {

    // ✅ SAFETY CHECK (VERY IMPORTANT)
    if (!this.offerId || !this.candidateId || !this.companyId || !this.regionId) {
      Swal.fire('Error', 'Missing offer details. Reload page.', 'error');
      return;
    }

    const formData = new FormData();

    formData.append('OfferId', String(this.offerId));
    formData.append('CandidateId', String(this.candidateId));
    formData.append('CompanyId', String(this.companyId));
    formData.append('RegionId', String(this.regionId));

    if (this.files.aadharCard) formData.append('AadharCard', this.files.aadharCard);
    if (this.files.panCard) formData.append('PanCard', this.files.panCard);
    if (this.files.passport) formData.append('Passport', this.files.passport);
    if (this.files.idProof) formData.append('IdProof', this.files.idProof);

    if (this.files.offerLetter) formData.append('OfferLetter', this.files.offerLetter);
    if (this.files.experienceLetter) formData.append('ExperienceLetter', this.files.experienceLetter);
    if (this.files.relievingLetter) formData.append('RelievingLetter', this.files.relievingLetter);
    if (this.files.hikeLetter) formData.append('HikeLetter', this.files.hikeLetter);

    this.recruitmentService.uploadCandidateDocuments(formData)
      .subscribe({
        next: () => {
          Swal.fire('Success', 'Documents Uploaded Successfully', 'success');
        },
        error: (err) => {
          console.log(err);
          Swal.fire('Error', 'Upload Failed', 'error');
        }
      });
  }
}
