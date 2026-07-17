import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../admin/servies/admin.service';
import { HelpdeskService } from '../../helpdesk/service/helpdesk.service';
import { EmployeeResignationService } from '../../employee-profile/employee-services/employee-resignation.service';
import { AssetService } from '../asset.service';
import Swal from 'sweetalert2';

import { environment } from '../../../../environments/environment.prod';

@Component({
  selector: 'app-asset-request',
  standalone: false,
  templateUrl: './asset-request.component.html',
  styleUrl: './asset-request.component.css'
})
export class AssetRequestComponent {
  assetRequestForm!: FormGroup;
  requests: any[] = [];
departmentName: any;
companyId :any;
   regionId :any
   userId :any;

  // ✅ Static Dropdown Data
  assetTypes: any[] = [];


  assetCategories: any[] = [];
  priorities: any[] = [];
  // companyId = Number(sessionStorage.getItem('CompanyId')) || 0;
  // regionId = Number(sessionStorage.getItem('RegionId')) || 0;
  // userId = Number(sessionStorage.getItem('UserId')) || 0;


  constructor(private fb: FormBuilder, private service: AdminService, private helpdeskService: HelpdeskService
    , private profileService: EmployeeResignationService, private assetService: AssetService) {
    }

  ngOnInit() {
    this.loadPermissions();
    this.companyId = Number(sessionStorage.getItem('CompanyId')) || 0;
    this.departmentName = sessionStorage.getItem('DepartmentName') || '';

    this.regionId = Number(sessionStorage.getItem('RegionId')) || 0;
    this.userId = Number(sessionStorage.getItem('UserId')) || 0;

    this.assetRequestForm = this.fb.group({
      employeeName: [''],
      employeeId: [''],
      departmentName: [this.departmentName ],
      assetType: ['', Validators.required],
      assetCategory: [''],
      requiredDate: ['', Validators.required],
      priority: [''],
      reason: ['', Validators.required],
      file: [null],
      hrEmail: ['']
    });

    this.loadProfile();
    this.loadRequests();
    this.loadAssetTypes();
    this.loadAssetCategories();
    this.loadPriorities();

    this.assetRequestForm.get('assetCategory')?.valueChanges.subscribe(() => {
      this.loadAssetTypes();
    });
  }
  viewDocument(filePath: string | undefined): void {

  }

  // normalizeDepartmentName(value: any): string {
  //   return value == null || value === '' ? '' : String(value).trim();
  // }

  // applyDepartmentName(value: any) {
  //   const normalized = this.normalizeDepartmentName(value);
  //   if (!normalized) {
  //     return;
  //   }

  //   this.departmentName = normalized;
  //   if (this.assetRequestForm) {
  //     this.assetRequestForm.patchValue({ departmentName: normalized });
  //   }
  // }

  // loadProfile() {
  //   if (!this.userId) return;

  //   this.profileService.GetempProfile(this.userId).subscribe({
  //     next: (res: any) => {
  //       const data = res?.data ?? res;
  //       if (data) {
  //         const deptName = this.normalizeDepartmentName(
  //           data.departmentName || data.DepartmentName || data.department?.departmentName || data.roleName || this.departmentName
  //         );

  //         this.assetRequestForm?.patchValue({
  //           employeeName: data.fullName || data.employeeName || '',
  //           employeeId: data.employeeCode || data.employeeId || '',
  //           departmentName: deptName || this.departmentName || ''
  //         });

  //         if (deptName) {
  //           this.applyDepartmentName(deptName);
  //         }
  //       } else if (this.departmentName) {
  //         this.applyDepartmentName(this.departmentName);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error loading profile', err);
  //     }
  //   });
  // }

  loadAssetTypes() {

  const categoryId = this.assetRequestForm.get('assetCategory')?.value;

  // if (!categoryId) {
  //   this.assetTypes = [];
  //   return;
  // }

  this.service.getAssetTypesByCompanyRegion(
    this.companyId,
    this.regionId,
     categoryId ? categoryId : 0   // ✅ ADD
  ).subscribe((res: any) => {

    this.assetTypes = res.data || res;

  });
}
  loadAssetCategories() {
    this.service.getAssetCategoriesByCompanyRegion(
      this.companyId,
      this.regionId
    ).subscribe((res: any) => {
      this.assetCategories = res.data || res;
    });
  }

  loadPriorities() {
    this.helpdeskService
      .getPriorities(this.companyId, this.regionId)
      .subscribe(res => {
        this.priorities = res;
      });
  }

  get f() {
    return this.assetRequestForm.controls;
  }

  submit() {
    if (this.assetRequestForm.invalid) {
      this.assetRequestForm.markAllAsTouched();

      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields',
      });

      return;
    }

    const v = this.assetRequestForm.value;

    const payload = {
      companyID: this.companyId,
      regionID: this.regionId,
      userID: this.userId,

      employeeName: v.employeeName,
      employeeCode: v.employeeId,
       departmentName: v.departmentName,

      assetType: v.assetType,
      assetCategory: v.assetCategory,

      requiredDate: v.requiredDate,
      priority: v.priority,

      reason: v.reason,

      fileName: v.file?.name || '',
      filePath: '',

      reportingTo: Number(sessionStorage.getItem("reportingManagerId")),
       hrEmail: v.hrEmail
    };

    // ✅ LOADING ALERT
    Swal.fire({
      title: 'Submitting...',
      text: 'Please wait',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.assetService.createAssetRequest(payload).subscribe({
      next: (res: any) => {

        Swal.close();

        // ✅ SUCCESS ALERT
        Swal.fire({
          icon: 'success',
          title: 'Request Submitted ✅',
          html: `
          <b>Request ID:</b> ${res} <br>
          Status: <b>Pending</b>
        `,
          confirmButtonText: 'OK'
        });

        this.loadRequests();
        this.assetRequestForm.reset();
        this.loadProfile();
      },

      error: (err) => {

        Swal.close();

        // ❌ ERROR ALERT
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: err?.error?.message || 'Something went wrong!',
        });
      }
    });
  }

  // loadRequests() {
  //   this.assetService.getMyRequests(this.userId)
  //     .subscribe(res => {
  //       this.requests = res;
  //       const firstRequest = Array.isArray(res) ? res[0] : null;
  //       const requestDept = this.normalizeDepartmentName(
  //         firstRequest?.departmentName || firstRequest?.DepartmentName || firstRequest?.department || this.departmentName
  //       );

  //       if (requestDept) {
  //         this.applyDepartmentName(requestDept);
  //       } else if (this.departmentName) {
  //         this.applyDepartmentName(this.departmentName);
  //       }
  //     });
  // }

  loadProfile() {
  if (!this.userId) return;

  this.profileService.GetempProfile(this.userId).subscribe({
    next: (res: any) => {
      const data = res?.data || {};

      this.assetRequestForm.patchValue({
        employeeName: data.fullName || '',
        employeeId: data.employeeCode || '',
        departmentName:
          data.departmentName ||
          sessionStorage.getItem('DepartmentName') ||
          this.requests[0]?.departmentName ||
          ''
      });
    },
    error: err => console.error(err)
  });
}

loadRequests() {
  this.assetService.getMyRequests(this.userId).subscribe((res: any[]) => {
    this.requests = res;

    if (!this.assetRequestForm.get('departmentName')?.value && res.length) {
      this.assetRequestForm.patchValue({
        departmentName: res[0].departmentName || ''
      });
    }
  });
}

  cancel() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Form data will be cleared',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, clear it',
      cancelButtonText: 'No'
      
    }).then(result => {
      if (result.isConfirmed) {
        this.assetRequestForm.reset();
        this.loadProfile();
      }
    });
  }



  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.assetRequestForm.patchValue({ file: file });
    }
  }
  getPriorityName(id: number): string {
    return this.priorities.find(x => x.priorityId === id)?.priorityName || '-';
  }
  getAssetTypeName(id?: number): string {
     if (!id || this.assetTypes.length === 0) return '-'; 
    return this.assetTypes.find(x => x.assetTypeId === id)?.assetTypeName ?? '-';
  }

  getAssetCategoryName(id?: number): string {
    return this.assetCategories.find(x => x.assetCategoryId === id)?.assetCategoryName ?? '-';
  }
  canAddAssignRequest = false;
  loadPermissions(): void {

  const menus = JSON.parse(
    sessionStorage.getItem('Menus') || '[]'
  );

  const assignAsset = menus.find(
    (m: any) =>
      m.menuName?.trim().toLowerCase() === 'asset request'
  );

  this.canAddAssignRequest =
    assignAsset?.canAdd ?? false;
}

}
