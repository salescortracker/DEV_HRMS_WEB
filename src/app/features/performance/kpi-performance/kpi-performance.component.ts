import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import { KpiPerformanceService } from '../kpi-performance.service';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-kpi-performance',
  standalone: false,
  templateUrl: './kpi-performance.component.html',
  styleUrl: './kpi-performance.component.css'
})
export class KpiPerformanceComponent {
 reviewForm!: FormGroup;
  managerReviews: any[] = [];
departmentName: string = '';
designationName: string = '';
  userId!: number;
  roleId!: number;
  reportingManagerId!: number;
  departmentId!: number;
  designation!: any;
  roleName!: string;
  canViewEmployeeSubmission = false;
  canViewManagerReviewApproval = false;
  canViewManagerkpiapproval = false;
  selectedTab: string = '';
  canViewManagerReviewHrReview =false;
  performanceReports: any[] = [];
  projects: any[] = [];
  selectedDraftId: number = 0;
  employeeSubmissions: any[] = [];
  isSubmittingSelected = false;

  pageSizeOptions = [5, 10, 20,50, 100];

  employeeSubmissionCurrentPage = 1;
  employeeSubmissionPageSize = 5;
  managerReviewCurrentPage = 1;
  managerReviewPageSize = 5;
  performanceReportCurrentPage = 1;
  performanceReportPageSize = 5;

  constructor(
    private fb: FormBuilder,
    private service: AdminService,
    private services: KpiPerformanceService
  ) { }

  // =========================
  // ✅ ngOnInit FIX
  // =========================
  ngOnInit(): void {
  this.LoadTabPermissions();
    // 🔥 ALWAYS read sessionStorage here (NOT outside)
    this.userId = Number(sessionStorage.getItem('UserId') || 0);
    this.roleId = Number(sessionStorage.getItem('roleId') || 0);
    this.reportingManagerId = Number(sessionStorage.getItem('reportingManagerId') || 0);
    this.designation = sessionStorage.getItem('Designation') || '';
    this.roleName = sessionStorage.getItem('roleName') || '';
    this.departmentId = Number(sessionStorage.getItem('DepartmentId') || 0);
       this.departmentName = sessionStorage.getItem('DepartmentName') || '';
  this.designationName = sessionStorage.getItem('DesignationName') || '';
     console.log('DepartmentId =', this.departmentId);
     console.log('DepartmentName =', this.  departmentName);


    this.departmentId = 0; // no longer needed if using name
    // this.designation = designation;


    
    this.initializeForm();
    this.patchUserValues();
    this.loadProjects();
    this.loadManagerReviews();
    this.loadPerformanceReports();
    this.loadEmployeeSubmissions();
  }

  loadProjects() {
    const companyId = Number(sessionStorage.getItem('CompanyId') || 0);
    const regionId = Number(sessionStorage.getItem('RegionId') || 0);

    if (!companyId || !regionId) return;

    this.service.getProjectNames(companyId, regionId).subscribe({
      next: (res: any) => {
        // handle different response shapes
        this.projects = res?.data || res || [];
      },
      error: () => {
        this.projects = [];
      }
    });
  }
  loadEmployeeSubmissions() {

  const userId = Number(sessionStorage.getItem('UserId'));

  // this.service.getEmployeeSubmissions(userId)
  //   .subscribe({

  //     next: (res: any) => {

  //       console.log("Employee Submission List", res);

  //       this.employeeSubmissions = res?.data || res || [];
  //     },

  //     error: (err:any) => {

  //       console.log(err);
  //       this.employeeSubmissions = [];
  //     }

  //   });

  this.service.getEmployeeSubmissions(userId).subscribe({
  next: (res: any) => {
    this.employeeSubmissions = res?.data || [];
    this.employeeSubmissionCurrentPage = 1;
    this.calculateEmployeeSubmissionPages();
    if (this.employeeSubmissions.length > 0) {
      this.reviewForm.patchValue({
        // designation: this.employeeSubmissions[0].designation || '',
        // department: this.employeeSubmissions[0].department || ''

         designation: this.employeeSubmissions[0].designation || sessionStorage.getItem('DesignationName') || '',
  department: this.employeeSubmissions[0].department || sessionStorage.getItem('DepartmentName') || ''
      });
//       this.reviewForm.patchValue({
//   designation: this.employeeSubmissions[0]?.designation 
//                || sessionStorage.getItem('DesignationName') 
//                || '',
//   department: this.employeeSubmissions[0]?.department 
//               || sessionStorage.getItem('DepartmentName') 
//               || ''
// });

    }
  }
});

}

canAddEmployeeSubmission = false;
canEditEmployeeSubmission = false;
canDeleteEmployeeSubmission = false;
  LoadTabPermissions() {
    const menus = JSON.parse(sessionStorage.getItem("Menus") || "[]");

  const employeesubmission = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "employee submission"
  );

  const managerreview = menus.find(
    (m:any) => m.menuName?.trim().toLowerCase() === "manager review & approval"
  );

 const performancereports = menus.find(
  (m:any) => m.menuName?.trim().toLowerCase() === "performance-reports"
);

 

 
  this.canViewEmployeeSubmission = employeesubmission?.canView ?? false;
    this.canAddEmployeeSubmission = employeesubmission?.canAdd ?? false;
  this.canEditEmployeeSubmission = employeesubmission?.canEdit ?? false;
  this.canDeleteEmployeeSubmission = employeesubmission?.canDelete ?? false;

   this.canViewManagerkpiapproval = performancereports?.canView ?? false;
  this.canViewManagerReviewApproval = managerreview?.canView ?? false;

  if (this.canViewEmployeeSubmission) this.selectedTab = 'tab1';
  else if (this.canViewManagerReviewApproval) this.selectedTab = 'tab2';
  else if (this.canViewManagerkpiapproval) this.selectedTab ='tab3';
  
  }

  // =========================
  // ✅ Initialize Form FIX
  // =========================
  initializeForm() {

    const currentYear = new Date().getFullYear(); // ✅ Auto 2026

    this.reviewForm = this.fb.group({
      id: [0],
      userId: [this.userId],
      roleId: [this.roleId],

      employeeName: [''],
      employeeCode: [''],
      designation: [''],
      department: [''],
      reportingManagerId: [this.reportingManagerId],
      departmentProject: [''],

      performanceCycle: ['Quarterly'], // ✅ default value
      applicableStartDate: [''],
      applicableEndDate: [''],
      appraisalYear: [currentYear.toString()],  // ✅ Auto current year
      selfReviewSummary: [''],
      reportingManagerName: '',
 hrEmail: [''],
      kpis: this.fb.array([])
    });

    this.addKpi();
  }

  // =========================
  // ✅ Patch Values FIX
  // =========================
  patchUserValues() {
  debugger;

  const department =
    sessionStorage.getItem('DepartmentName') ||
    sessionStorage.getItem('Department') ||
    '';

  const designation =
    sessionStorage.getItem('DesignationName') ||
    sessionStorage.getItem('Designation') ||
    '';

  console.log("Department:", department);
  console.log("Designation:", designation);

  this.reviewForm.patchValue({

    employeeName: sessionStorage.getItem('Name') || '',

    employeeCode: sessionStorage.getItem('EmployeeCode') || '',

    departmentProject: sessionStorage.getItem('DepartmentProject') || '',

    department: department,

    designation: designation,

    reportingManagerName:
      sessionStorage.getItem('ReportingManagerName') || ''

  });

  console.log("Patched Form:", this.reviewForm.value);
}



  // =========================
  get kpis(): FormArray {
    return this.reviewForm.get('kpis') as FormArray;
  }

  addKpi() {
    this.kpis.push(
      this.fb.group({
        kpiName: [''],
        weightage: [''],
        target: [''],
        achieved: [''],
        selfRating: [''],
        remarks: ['']
      })
    );
  }
allowDecimal(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement;

  // Allow only one decimal point
  if (event.key === '.' && input.value.includes('.')) {
    event.preventDefault();
    return;
  }

  // Prevent scientific notation and negative values
  if (['e', 'E', '+', '-'].includes(event.key)) {
    event.preventDefault();
  }
}

  removeKpi(index: number) {
    this.kpis.removeAt(index);
  }

  sortByLatestDate(items: any[]): any[] {
    return [...items].sort((a, b) => {
      const dateA = new Date(
        a.createdDate || a.createdOn || a.updatedDate || a.updatedOn || a.applicableStartDate || a.applicableEndDate || a.appraisalYear || 0
      ).getTime();
      const dateB = new Date(
        b.createdDate || b.createdOn || b.updatedDate || b.updatedOn || b.applicableStartDate || b.applicableEndDate || b.appraisalYear || 0
      ).getTime();
      return dateB - dateA;
    });
  }

  get paginatedEmployeeSubmissions(): any[] {
    const start = (this.employeeSubmissionCurrentPage - 1) * this.employeeSubmissionPageSize;
    return this.employeeSubmissions.slice(start, start + this.employeeSubmissionPageSize);
  }

  get employeeSubmissionTotalPages(): number {
    return Math.max(1, Math.ceil(this.employeeSubmissions.length / this.employeeSubmissionPageSize));
  }

  calculateEmployeeSubmissionPages(): void {
    this.employeeSubmissionCurrentPage = 1;
  }

  changeEmployeeSubmissionPage(page: number): void {
    if (page >= 1 && page <= this.employeeSubmissionTotalPages) {
      this.employeeSubmissionCurrentPage = page;
    }
  }

  changeEmployeeSubmissionPageSize(size: number): void {
    this.employeeSubmissionPageSize = size;
    this.employeeSubmissionCurrentPage = 1;
  }

  get paginatedManagerReviews(): any[] {
    const start = (this.managerReviewCurrentPage - 1) * this.managerReviewPageSize;
    return this.managerReviews.slice(start, start + this.managerReviewPageSize);
  }

  get managerReviewTotalPages(): number {
    return Math.max(1, Math.ceil(this.managerReviews.length / this.managerReviewPageSize));
  }

  calculateManagerReviewPages(): void {
    this.managerReviewCurrentPage = 1;
  }

  changeManagerReviewPage(page: number): void {
    if (page >= 1 && page <= this.managerReviewTotalPages) {
      this.managerReviewCurrentPage = page;
    }
  }

  changeManagerReviewPageSize(size: number): void {
    this.managerReviewPageSize = size;
    this.managerReviewCurrentPage = 1;
  }

  get paginatedPerformanceReports(): any[] {
    const start = (this.performanceReportCurrentPage - 1) * this.performanceReportPageSize;
    return this.performanceReports.slice(start, start + this.performanceReportPageSize);
  }

  get performanceReportTotalPages(): number {
    return Math.max(1, Math.ceil(this.performanceReports.length / this.performanceReportPageSize));
  }

  calculatePerformanceReportPages(): void {
    this.performanceReportCurrentPage = 1;
  }

  changePerformanceReportPage(page: number): void {
    if (page >= 1 && page <= this.performanceReportTotalPages) {
      this.performanceReportCurrentPage = page;
    }
  }

  changePerformanceReportPageSize(size: number): void {
    this.performanceReportPageSize = size;
    this.performanceReportCurrentPage = 1;
  }

  submit() {
    
      this.reviewForm.patchValue({
          id: this.selectedDraftId
        });

    console.log(this.reviewForm.value);

    this.service.submit(this.reviewForm.value)
      .subscribe({
        
        next: () => {
debugger;
          Swal.fire({
            icon: 'success',
            title: 'Submitted Successfully',
            text: 'Your KPI has been submitted.',
            confirmButtonColor: '#28a745'
          });

          // ✅ RESET FORM
          this.reviewForm.reset();

          // ✅ Reinitialize form with default values
          this.initializeForm();
          this.patchUserValues();

          // ✅ Reload submitted records instantly without refreshing the page
          this.loadEmployeeSubmissions();

        },
        error: (err:any) => {
          Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text: 'Something went wrong!'
          });
        }
      });
  }

  saveDraft() {

    this.service.saveDraft(this.reviewForm.value)
      .subscribe(() => {

        Swal.fire({
          icon: 'success',
          title: 'Draft Saved Successfully',
          confirmButtonColor: '#ffc107'
        });

        // ✅ Refresh submitted/draft records immediately
        this.loadEmployeeSubmissions();

      });
  }



  loadManagerReviews() {

    const loggedInUserId = Number(sessionStorage.getItem('UserId') || 0);

    if (!loggedInUserId) {
      console.log("No logged in user");
      this.managerReviews = [];
      return;
    }

    console.log("Logged In UserId:", loggedInUserId);

    this.service.getManagerReviews(loggedInUserId)
      .subscribe((res: any) => {
        console.log("API Response:", res);
        this.managerReviews = this.sortByLatestDate(res?.data || []);
        this.managerReviewCurrentPage = 1;
        this.calculateManagerReviewPages();
      });
  }

  approve(id: number) {

    Swal.fire({
      title: 'Approve Review',
      input: 'textarea',
      inputLabel: 'Enter approval remarks',
      inputPlaceholder: 'Type your remarks here...',
      inputAttributes: {
        'aria-label': 'Enter your remarks'
      },
      showCancelButton: true,
      confirmButtonText: 'Approve',
      confirmButtonColor: '#28a745',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Remarks are required!';
        }
        return null;
      }
    }).then((result) => {

      if (result.isConfirmed) {

        const managerId = Number(sessionStorage.getItem('UserId'));

        this.service.approve(id, managerId, result.value)
          .subscribe(() => {

            Swal.fire({
              icon: 'success',
              title: 'Approved!',
              text: 'Review has been approved successfully.',
              timer: 2000,
              showConfirmButton: false
            });

            this.loadManagerReviews();
          });

      }

    });
  }

  reject(id: number) {

    Swal.fire({
      title: 'Reject Review',
      input: 'textarea',
      inputLabel: 'Enter rejection reason',
      inputPlaceholder: 'Type reason here...',
      inputAttributes: {
        'aria-label': 'Enter rejection reason'
      },
      showCancelButton: true,
      confirmButtonText: 'Reject',
      confirmButtonColor: '#dc3545',
      cancelButtonText: 'Cancel',
      inputValidator: (value) => {
        if (!value) {
          return 'Rejection reason is required!';
        }
        return null;
      }
    }).then((result) => {

      if (result.isConfirmed) {

        const managerId = Number(sessionStorage.getItem('UserId'));

        this.service.reject(id, managerId, result.value)
          .subscribe(() => {

            Swal.fire({
              icon: 'success',
              title: 'Rejected!',
              text: 'Review has been rejected successfully.',
              timer: 2000,
              showConfirmButton: false
            });

            this.loadManagerReviews();
          });

      }

    });
  }

bulkApprove() {

  const selected = this.managerReviews
    .filter(x => x.isSelected);

  if (selected.length === 0) {
    Swal.fire('Please select at least one record');
    return;
  }

  Swal.fire({
    title: 'Approve Selected?',
    input: 'textarea',
    inputLabel: 'Enter approval remarks',
    showCancelButton: true
  }).then(result => {

    if (result.isConfirmed) {

      const managerId = Number(sessionStorage.getItem('UserId'));

      selected.forEach(review => {
        this.service.approve(review.id, managerId, result.value)
          .subscribe();
      });

      Swal.fire('Approved Successfully');
      this.loadManagerReviews();
    }

  });
}
bulkReject() {

  const selected = this.managerReviews
    .filter(x => x.isSelected);

  if (selected.length === 0) {
    Swal.fire('Please select at least one record');
    return;
  }

  Swal.fire({
    title: 'Reject Selected?',
    input: 'textarea',
    inputLabel: 'Enter rejection reason',
    inputPlaceholder: 'Type rejection reason here...',
    showCancelButton: true,
    confirmButtonText: 'Reject',
    confirmButtonColor: '#dc3545',
    cancelButtonText: 'Cancel',
    inputValidator: (value) => {
      if (!value) {
        return 'Rejection reason is required!';
      }
      return null;
    }
  }).then(result => {

    if (result.isConfirmed) {

      const managerId = Number(sessionStorage.getItem('UserId'));

      selected.forEach(review => {
        this.service.reject(review.id, managerId, result.value)
          .subscribe();
      });

      Swal.fire({
        icon: 'success',
        title: 'Rejected Successfully',
        timer: 1500,
        showConfirmButton: false
      });

      this.loadManagerReviews();
    }

  });
}
loadPerformanceReports() {

  const userId = Number(sessionStorage.getItem('UserId') || 0);
  const roleName = sessionStorage.getItem('roleName') || '';

  this.services.getPerformanceReports(userId, roleName)
    .subscribe({
      next: (res: any) => {

        console.log("Performance Reports:", res);

        this.performanceReports = this.sortByLatestDate(res?.data || res || []);
        this.performanceReportCurrentPage = 1;
        this.calculatePerformanceReportPages();
      },
      error: (err: any) => {
        console.log("Performance Reports Error:", err);
      }
    });
}
selectedReport: any = null;
viewReport(item: any) {

  this.selectedReport = item;

  Swal.fire({
    title: 'KPI Details',

    html: `
      <div style="text-align:left">

        <p><b>Employee:</b> ${item.employeeName}</p>

        <p><b>Project:</b> ${item.departmentProject}</p>

        <p><b>Cycle:</b> ${item.performanceCycle}</p>

        <p><b>Year:</b> ${item.appraisalYear}</p>

        <p><b>Status:</b> ${item.status}</p>

        <p><b>Summary:</b> ${item.selfReviewSummary || '-'}</p>
        

      </div>
    `,

    width: 700
  });

}

  submitSelectedDrafts() {
    debugger;
    const selected = this.employeeSubmissions.filter((x: any) => x.isSelected && x.status === 'Draft');

    if (!selected || selected.length === 0) {
      Swal.fire('Please select at least one draft to submit');
      return;
    }

    Swal.fire({
      title: `Submit ${selected.length} selected draft(s)?`,
      showCancelButton: true,
      confirmButtonText: 'Submit',
      confirmButtonColor: '#28a745'
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.isSubmittingSelected = true;

      const requests = selected.map((item: any) => this.service.submit(item));

      forkJoin(requests).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Submitted Successfully',
            text: `${selected.length} draft(s) submitted.`,
            confirmButtonColor: '#28a745'
          });

          this.isSubmittingSelected = false;
          this.loadEmployeeSubmissions();
        },
        error: (err: any) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Submission Failed',
            text: 'One or more submissions failed.'
          });
          this.isSubmittingSelected = false;
          this.loadEmployeeSubmissions();
        }
      });
    });
  }

  onDraftSelect(item: any) {

  if (item.isSelected) {

    this.selectedDraftId = item.id;

    this.reviewForm.patchValue({
      id: item.id
    });

    console.log("Selected Draft Id =", item.id);
  }

}
}
