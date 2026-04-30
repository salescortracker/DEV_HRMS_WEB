import { Component } from '@angular/core';
import { AdminService } from '../../servies/admin.service';
import { environment } from '../../../../environments/environment';
import { RecruitmentService } from '../../../features/recruitment/service/recruitment.service';
import Swal from 'sweetalert2';

export interface JobApplication {
  candidateName: string;
  email: string;
  phone: string;
  jobTitle: string;
  experienceYears: number;
  technology: string;
  resumeUrl?: string;
}
@Component({
  selector: 'app-job-application',
  standalone: false,
  templateUrl: './job-application.component.html',
  styleUrl: './job-application.component.css'
})
export class JobApplicationComponent {
  technologies: string[] = [
  'Angular',
  '.NET Core',
  'SQL',
  'React',
  'Java',
  'Python'
];

  model: JobApplication = this.getEmpty();
  companyLogo: string = 'assets/images/default-logo.png';
  companyId!: number;

  selectedTechnologies: string[] = [];
  selectedFile: File | null = null;

  constructor(private adminService: AdminService, private jobService: RecruitmentService) {}

  ngOnInit() {
    this.loadCompany();
    console.log("Technologies:", this.technologies);
  }

  loadCompany() {
    const id = sessionStorage.getItem('CompanyId');

    if (!id) {
      this.companyLogo = 'assets/images/default-logo.png';
      return;
    }

    this.companyId = Number(id);

    this.adminService.getCompanyById(this.companyId).subscribe({
      next: (res: any) => {

        const company = res?.data ?? res;
        let logo = company?.companyLogo;

        if (!logo || logo.trim() === '') {
          this.companyLogo = 'assets/images/default-logo.png';
          return;
        }

        // normalize path
        logo = logo.replace(/\\/g, '/').trim();

        // full URL
        if (logo.startsWith('http')) {
          this.companyLogo = logo;
        }
        // local assets
        else if (logo.startsWith('assets')) {
          this.companyLogo = logo;
        }
        // backend file path
        else {
          const base = environment.baseurl.replace(/\/$/, '');
          this.companyLogo = `${base}/${logo}`;
        }

        console.log('Company Logo Loaded:', this.companyLogo);
      },

      error: (err) => {
        console.error('Company API error:', err);
        this.companyLogo = 'assets/images/default-logo.png';
      }
    });
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

onSubmit() {
  debugger;
  this.model.technology = this.selectedTechnologies.join(',');

  const formData = new FormData();

  formData.append('candidateName', this.model.candidateName);
  formData.append('email', this.model.email);
  formData.append('phone', this.model.phone);
  formData.append('jobTitle', this.model.jobTitle);
  formData.append('experienceYears', String(this.model.experienceYears));
  formData.append('technology', this.model.technology);

  if (this.selectedFile) {
    formData.append('Resume', this.selectedFile);
  }

  this.jobService.submitApplication(formData).subscribe({
    next: (res: any) => {
      Swal.fire('Success', 'Application Submitted', 'success');
      this.resetForm();
    }
  });
}
getEmpty(): JobApplication {
  return {
    candidateName: '',
    email: '',
    phone: '',
    jobTitle: '',
    experienceYears: 0,
    technology: ''
  };
}

resetForm() {
  this.model = this.getEmpty();
  this.selectedTechnologies = [];
  this.selectedFile = null;
}
}