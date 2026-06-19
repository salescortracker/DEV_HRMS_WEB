import { Component, OnInit } from '@angular/core';
import { AdminService, EmployeeCertificationDto } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-employee-skills',
  standalone: false,
  templateUrl: './employee-skills.component.html',
  styleUrl: './employee-skills.component.css'
})
export class EmployeeSkillsComponent implements OnInit {

  canJobHistory = false;
  canEducation = false;
  canCertification = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadTabPermissions();
  }

  loadTabPermissions(): void {

    const menus = JSON.parse(sessionStorage.getItem('Menus') || '[]');

    const jobHistory = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'job history'
    );

    const education = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'education'
    );

    const certification = menus.find(
      (m: any) => m.menuName?.trim().toLowerCase() === 'certification'
    );

    this.canJobHistory = jobHistory?.canView ?? false;
    this.canEducation = education?.canView ?? false;
    this.canCertification = certification?.canView ?? false;

    const currentUrl = this.router.url;

    if (currentUrl === '/skills') {

      if (this.canJobHistory) {
        this.router.navigate(['/skills/job-history']);
      }
      else if (this.canEducation) {
        this.router.navigate(['/skills/education']);
      }
      else if (this.canCertification) {
        this.router.navigate(['/skills/certification']);
      }

    }
  }
}
