import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import { KpiPerformanceService } from '../kpi-performance.service';
@Component({
  selector: 'app-manager-review',
  standalone: false,
  templateUrl: './manager-review.component.html',
  styleUrl: './manager-review.component.css'
})
export class ManagerReviewComponent {

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
  
  employeeSubmissions: any[] = [];

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
    this.loadManagerReviews();
    this.loadPerformanceReports();
    this.loadEmployeeSubmissions();
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
    if (this.employeeSubmissions.length > 0) {
      this.reviewForm.patchValue({
        designation: this.employeeSubmissions[0].designation || '',
        department: this.employeeSubmissions[0].department || ''
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

    this.reviewForm.patchValue({
      employeeName: sessionStorage.getItem('Name') || '',
      employeeCode: sessionStorage.getItem('EmployeeCode') || '',
      departmentProject: sessionStorage.getItem('DepartmentProject') || '',

      department: sessionStorage.getItem('DepartmentName') || '',
      designation: sessionStorage.getItem('DesignationName') || '',
      reportingManagerName: sessionStorage.getItem('ReportingManagerName') || '',

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
allowOnlyInteger(event: KeyboardEvent) {
  const invalidKeys = ['.', ',', 'e', 'E', '-', '+'];

  if (invalidKeys.includes(event.key)) {
    event.preventDefault();
  }
}

  removeKpi(index: number) {
    this.kpis.removeAt(index);
  }


  submit() {

    console.log(this.reviewForm.value);

    this.service.submit(this.reviewForm.value)
      .subscribe({
        next: () => {

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
        this.managerReviews = res?.data || [];
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
  requestReview(id: number) {

  this.service.request(id)
    .subscribe(() => {

      Swal.fire({
        icon: 'success',
        title: 'Requested Successfully',
        timer: 1500,
        showConfirmButton: false
      });

      this.loadManagerReviews();
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

        this.performanceReports = res?.data || res || [];
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
}
