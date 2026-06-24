import { Component, OnInit } from '@angular/core';
import { AdminService, Department } from '../../../admin/servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { ViewChild, ElementRef } from '@angular/core';
interface Policy {
  Title: string
  Category: string
  EffectiveDate: Date
  Description?: string
  FileName?: string
  FileUrl?: string
  // DepartmentId: number
  DepartmentIds: number[];
}
@Component({
  selector: 'app-employee-policy',
  standalone: false,
  templateUrl: './employee-policy.component.html',
  styleUrl: './employee-policy.component.css'
})
export class EmployeePolicyComponent {
  policies: Policy[] = []
  filteredPoliciesList: Policy[] = []

  // categories: string[] = []
  categories: any[] = []

  selectedCategory = '';
  fromDate?: string
  toDate?: string

  userId: number = 0
  userDepartmentId: number = 0
  companyId: number = 0;
  regionId: number = 0;

  // categories: any[] = [];

 // constructor(private adminService: AdminService) { }
  constructor(private adminService: AdminService, private spinner: NgxSpinnerService) { }

  ngOnInit(): void {

    this.userId = Number(sessionStorage.getItem("UserId"))
    this.userDepartmentId = Number(sessionStorage.getItem("DepartmentId"))

    console.log("UserId:", this.userId)
    console.log("DepartmentId:", this.userDepartmentId)
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));
    console.log("CompanyId:", this.companyId);
    console.log("RegionId:", this.regionId);
    this.loadPolicyCategories();

    this.loadCategories()
    this.getPolicies()

  }
  loadPolicyCategories() {

    this.adminService
      .getPolicyCategoriesByCompanyRegion(
        this.companyId,
        this.regionId
      )
      .subscribe((res: any) => {
        console.log("Policy Categories API:", res);

        this.categories =
          res.data || [];
        console.log("Categories:", this.categories);

      });

  }

  // -----------------------------
  // Get Policies
  // -----------------------------
  getPolicies() {

    const companyId = Number(sessionStorage.getItem("CompanyId"));
    const regionId = Number(sessionStorage.getItem("RegionId"));

    this.adminService.getTodayPolicies(companyId, regionId)
      .subscribe((res: any[]) => {

        console.log("Policy API Response:", res)

        this.policies = res.map(p => ({

          Title: p.policyTitle,
          Category: p.category,
          EffectiveDate: new Date(p.effectiveDate),
          Description: p.policyDescription,
          FileName: p.fileName,
          FileUrl: p.fileUrl,
          DepartmentIds: p.departmentIds || []

        }))
        this.filteredPoliciesList = this.policies.filter(p =>
          p.DepartmentIds.includes(this.userDepartmentId)
        );

        // this.loadCategories()

        this.filterTodayPolicies()
        // this.filterTodayPolicies()

      })
  }


  // -----------------------------
  // Load Categories
  // -----------------------------
  // loadCategories() {

  //   this.categories = [...new Set(this.policies.map(x => x.Category))]

  // }

  loadCategories() {
    const companyId = Number(sessionStorage.getItem("CompanyId"));
    const regionId = Number(sessionStorage.getItem("RegionId"));

    this.adminService.getPolicyCategorie(companyId, regionId).subscribe({
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
  // -----------------------------
  // Show Today's Policies
  // -----------------------------
  filterTodayPolicies() {

    const today = new Date().toDateString()

    this.filteredPoliciesList = this.policies.filter(p => {

      const policyDate = new Date(p.EffectiveDate).toDateString()

      return (
        p.DepartmentIds.includes(this.userDepartmentId) &&
        policyDate === today
      )

    })

  }

  // -----------------------------
  // Apply Filter
  // -----------------------------
  // applyFilter() {
  //    const hasFilter =
  //   this.selectedCategory ||
  //   this.fromDate ||
  //   this.toDate;

  // if (!hasFilter) {
  //   this.filterTodayPolicies();
  //   return;
  // }

  //   this.filteredPoliciesList = this.policies.filter(p => {

  //     const policyDate = new Date(p.EffectiveDate)

  //     const matchDept =
  // p.DepartmentIds.includes(this.userDepartmentId);

  //     const matchCategory =
  //       this.selectedCategory
  //         ? p.Category === this.selectedCategory
  //         : true

  //     const matchFrom =
  //       this.fromDate
  //         ? policyDate >= new Date(this.fromDate)
  //         : true

  //     const matchTo =
  //       this.toDate
  //         ? policyDate <= new Date(this.toDate)
  //         : true

  //     return matchDept && matchCategory && matchFrom && matchTo

  //   })

  // }


  applyFilter() {

    this.filteredPoliciesList = this.policies.filter(p => {

      const policyDate = new Date(p.EffectiveDate);

      const matchDept =
        p.DepartmentIds.includes(this.userDepartmentId);

      const matchCategory =
        this.selectedCategory
          ? p.Category === this.selectedCategory
          : true;

      const matchDate =
        this.fromDate
          ? policyDate.toDateString() ===
          new Date(this.fromDate).toDateString()
          : true;

      return matchDept &&
        matchCategory &&
        matchDate;

    });

  }
}