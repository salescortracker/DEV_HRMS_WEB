import { Component } from '@angular/core';
import { AdminService, Department } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { ViewChild, ElementRef } from '@angular/core';

interface Policy {
  Title: string;
  Category: string;
  EffectiveDate: Date;
  Description?: string;
  FileName?: string;
  FileUrl?: string;
}
@Component({
  selector: 'app-company-policies',
  standalone: false,
  templateUrl: './company-policies.component.html',
  styleUrl: './company-policies.component.css'
})
export class CompanyPoliciesComponent {
   @ViewChild('fileInput') fileInput!: ElementRef;
 companies: any[] = []
  regions: any[] = []
  departments: Department[] = []
 categories: any[] = []; 
  policies: any[] = []
  paginatedPolicies: any[] = []
filteredDepartments: any[] = [];
  userId!: number
  companyId!: number
  regionId!: number
  filteredRegions: any[] = []; 

  currentPage = 1
  pageSize = 5
  totalPages = 1

  isEditMode = false
showDepartmentDropdown = false;
  policy: any = this.resetPolicy()

  // categories: string[] = [
  //   "HR Policy",
  //   "Leave Policy",
  //   "Attendance Policy",
  //   "IT Security Policy",
  //   "Work From Home Policy",
  //   "Travel Policy"
  // ]

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {

    this.userId = Number(sessionStorage.getItem("UserId"))
    this.companyId = Number(sessionStorage.getItem("CompanyId"))
    this.regionId = Number(sessionStorage.getItem("RegionId"))

    this.loadCompanies()
    this.loadRegions()
    this.loadDepartments()
    this.getPolicies()
    this.loadCategories()

  }
  loadCategories() {
    this.adminService.getPolicyCategories(this.userId).subscribe({
      next: (res: any) => {
        const data = res.data || [];
      this.categories = data.map((x: any) => ({
  PolicyCategoryId: x.policyCategoryId,

  // 🔥 FIX HERE (case-sensitive)
  CompanyId: x.companyId ?? x.CompanyId,
  RegionId: x.regionId ?? x.RegionId,

  companyName: x.companyName,
  regionName: x.regionName,
  userId: x.userId,

  PolicyCategoryName: x.policyCategoryName,
  Description: x.description,
  IsActive: x.isActive
}));
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load policy categories', 'error');
      }
    });
  }

  resetPolicy() {

  return {

    PolicyId: 0,
    CompanyId: this.companyId || null,
    RegionId: this.regionId || null,
 DepartmentIds: [],
    Title: '',
    Category: '',
    EffectiveDate: new Date().toISOString().split('T')[0],
    Description: '',

    Attachment: null

  }

}

  loadCompanies() {

    this.adminService.getCompanies(null, this.userId)
      .subscribe(res => {
        this.companies = res
      })

  }

  loadRegions() {
  this.adminService.getRegions(null, this.userId)
    .subscribe(res => {
      this.regions = res;
    });
}
onCompanyChange() {
  this.policy.RegionId = null;

  this.filteredRegions = this.policy.CompanyId
    ? this.regions.filter(r => Number(r.companyID) === Number(this.policy.CompanyId))
    : [];
    this.filteredDepartments = [];
}

  loadDepartments() {

    this.adminService.getDepartments(this.userId)
      .subscribe((res: any) => {
        this.departments = res.data.data.filter((x: any) => x.isActive);
        this.filterDepartments();
        
      });

  }

  getDepartmentName(ids: number[] | number): string {

  const arr = Array.isArray(ids) ? ids : [ids];

  if (!arr || arr.length === 0) return '-';

  return this.departments
    .filter(d => arr.includes(d.departmentId))
    .map(d => d.departmentName)
    .join(', ');
}

  getPolicies() {

    this.spinner.show()

    this.adminService.getAllPolicies(this.userId)
      .subscribe(res => {

this.policies = res.map((x: any) => ({

  PolicyId: x.policyId,
  CompanyId: x.companyId ?? x.companyID,
  RegionId: x.regionId ?? x.regionID,

  // ✅ IMPORTANT FIX
  DepartmentIds: x.departmentIds?.length
    ? x.departmentIds
    : x.departmentId
      ? [x.departmentId]
      : [],

  Title: x.policyTitle,
  Category: x.category,
  EffectiveDate: x.effectiveDate,
  Description: x.policyDescription,
  FileName: x.attachmentName,
  FileUrl: x.attachmentPath
}));

        this.setPagination()

        this.spinner.hide()

      })

  }

  onFileSelected(e: any) {

    const file = e.target.files[0];

  if (file) {

    this.policy.Attachment = file;

    // ✅ ADD THESE
    this.policy.FileName = file.name;

    this.policy.FileUrl = 'Uploads/' + file.name;

  }

  }

onSubmit() {
  if (
    !this.policy.CompanyId ||
    !this.policy.RegionId ||
    !this.policy.DepartmentIds?.length ||
    !this.policy.Title ||
    !this.policy.Category ||
    !this.policy.EffectiveDate ||
    !this.policy.Description
  ) {
    Swal.fire('Validation', 'Please fill all required fields', 'warning');
    return;
  }
  const payload = {

    policyId: this.policy.PolicyId,
    userId: this.userId,

    companyId: this.policy.CompanyId
      ? Number(this.policy.CompanyId)
      : null,

    regionId: this.policy.RegionId
      ? Number(this.policy.RegionId)
      : null,

    departmentIds: this.policy.DepartmentIds || [],

    policyTitle: this.policy.Title,
    policyDescription: this.policy.Description,

    category: this.policy.Category,

    effectiveDate: this.policy.EffectiveDate,
    expiryDate: null,

      // ✅ ADD THESE
      attachmentName: this.policy.Attachment?.name || this.policy.FileName || null,

attachmentPath: this.policy.Attachment
  ? ('Uploads/' + this.policy.Attachment.name)
  : (this.policy.FileUrl || null),
    // attachmentName: this.policy.Attachment?.name || null,
    // attachmentPath: this.policy.FileUrl || null,

    postedDate: new Date().toISOString().split('T')[0],

    isActive: true,

    createdBy: this.userId,
    updatedBy: this.isEditMode ? this.userId : null

  }

  const request = this.isEditMode
    ? this.adminService.updatePolicy(this.policy.PolicyId, payload)
    : this.adminService.savePolicy(payload)

  request.subscribe(() => {

    Swal.fire("Success", "Policy Saved", "success")

    this.resetForm()

    this.getPolicies()
    console.log('DepartmentIds = ', this.policy.DepartmentIds);

console.log(JSON.stringify(payload, null, 2));


  // ✅ CLEAR FILE INPUT
  if (this.fileInput) {
    this.fileInput.nativeElement.value = '';
  }

  })

}

  // editPolicy(p: any) {

  //   this.isEditMode = true

  //   this.policy = { ...p }

  //   this.policy.EffectiveDate = new Date(p.EffectiveDate)
  //     .toISOString()
  //     .split('T')[0]
  //     this.filteredRegions = this.regions.filter(r =>
  //   Number(r.companyID) === Number(this.policy.CompanyId)
  // );

  // }

//   editPolicy(p: any) {

//   this.isEditMode = true;

//   this.policy = {
//     ...p,
//     CompanyId: Number(p.CompanyId),
//     RegionId: Number(p.RegionId),
//     DepartmentIds: [...(p.DepartmentIds || [])]
//   };

//   // Date Format
//   this.policy.EffectiveDate = new Date(p.EffectiveDate)
//     .toISOString()
//     .split('T')[0];

//   // Company Set
//   this.policy.CompanyId = Number(p.CompanyId);

//   // Region Dropdown Load
//   this.filteredRegions = this.regions.filter(
//     r => Number(r.companyID) === Number(this.policy.CompanyId)
//   );

//   // Region Set
//   this.policy.RegionId = Number(p.RegionId);

//   // Department Dropdown Load
//   this.filterDepartments();

//   console.log(this.policy);
// }



editPolicy(p: any) {

  this.isEditMode = true;

  this.policy = {
    ...p,
    CompanyId: Number(p.CompanyId),
    RegionId: Number(p.RegionId),
    DepartmentIds: [...(p.DepartmentIds || [])]
  };

  this.policy.EffectiveDate = new Date(p.EffectiveDate)
    .toISOString()
    .split('T')[0];

  // Company selected ayyaka region list load cheyyali
  this.filteredRegions = this.regions.filter(
    (r: any) => Number(r.companyID) === Number(this.policy.CompanyId)
  );

  // Department list load cheyyali
  this.filteredDepartments = this.departments.filter(
    (d: any) =>
      Number(d.companyId) === Number(this.policy.CompanyId) &&
      Number(d.regionId) === Number(this.policy.RegionId)
  );

  console.log('Edit Policy:', this.policy);
}


  deletePolicy(p: any) {

    Swal.fire({

      title: 'Delete?',
      text: 'Confirm delete policy',
      icon: 'warning',
      showCancelButton: true

    }).then(r => {

      if (r.isConfirmed) {

        this.adminService.deletePolicy(p.PolicyId, this.userId)
        .subscribe({
          next: () => {
            Swal.fire("Deleted", "Policy removed", "success");
            this.getPolicies();
          },
          error: (err) => {
            console.log(err);
            Swal.fire("Error", "Delete failed", "error");
          }
        });

      }

    })

  }

  resetForm() {

    this.policy = this.resetPolicy()
      this.policy.Attachment = null;
  this.policy.FileName = null;
  this.policy.FileUrl = null;

    this.isEditMode = false

  }


  onRegionChange() {
  this.filterDepartments();
}

filterDepartments() {

  this.filteredDepartments = this.departments.filter(
    (d: any) =>
      Number(d.companyId) === Number(this.policy.CompanyId) &&
      Number(d.regionId) === Number(this.policy.RegionId)
  );
}

onDepartmentChange(event: any, departmentId: number) {

  if (!this.policy.DepartmentIds) {
    this.policy.DepartmentIds = [];
  }

  if (event.target.checked) {
    this.policy.DepartmentIds.push(departmentId);
  } else {
    this.policy.DepartmentIds =
      this.policy.DepartmentIds.filter(
        (id: number) => id !== departmentId
      );
  }
}

toggleAllDepartments(event: any) {

  if (event.target.checked) {

    this.policy.DepartmentIds =
      this.filteredDepartments.map(
        (d: any) => d.departmentId
      );

  } else {

    this.policy.DepartmentIds = [];

  }

}

isAllDepartmentsSelected(): boolean {

  return this.filteredDepartments.length > 0 &&
    this.policy.DepartmentIds?.length ===
    this.filteredDepartments.length;

}

// getSelectedDepartmentNames(): string {

//   if (!this.policy.DepartmentIds?.length) {
//     return 'Select Departments';
//   }

//   return this.filteredDepartments
//     .filter((d: any) =>
//       this.policy.DepartmentIds.includes(d.departmentId)
//     )
//     .map((d: any) => d.departmentName)
//     .join(', ');
// }

getSelectedDepartmentNames(): string {

  if (!this.policy.DepartmentIds?.length) {
    return 'Select Departments';
  }

  const names = this.filteredDepartments
    .filter((d: any) =>
      this.policy.DepartmentIds.includes(d.departmentId)
    )
    .map((d: any) => d.departmentName);

  return names.length
    ? names.join(', ')
    : `${this.policy.DepartmentIds.length} Department(s) Selected`;
}

setPagination(): void {

  this.totalPages = Math.ceil(this.policies.length / this.pageSize) || 1;

  if (this.currentPage > this.totalPages) {
    this.currentPage = this.totalPages;
  }

  if (this.currentPage < 1) {
    this.currentPage = 1;
  }

  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;

  this.paginatedPolicies = this.policies.slice(start, end);
}

changePage(page: number): void {

  if (page < 1 || page > this.totalPages) return;

  this.currentPage = page;
  this.setPagination();
}

nextPage(): void {

  if (this.currentPage < this.totalPages) {
    this.currentPage++;
    this.setPagination();
  }
}

prevPage(): void {

  if (this.currentPage > 1) {
    this.currentPage--;
    this.setPagination();
  }
}
}
