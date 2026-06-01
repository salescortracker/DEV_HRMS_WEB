import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../admin/servies/admin.service';

interface Policy {
  Title: string
  Category: string
  EffectiveDate: Date
  Description?: string
  FileName?: string
  FileUrl?: string
  DepartmentId: number
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

  
  selectedCategory: string = ''
  fromDate?: string
  toDate?: string

  userId: number = 0
  userDepartmentId: number = 0
  policyCategories: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {

  this.userId = Number(sessionStorage.getItem("UserId"));
  this.userDepartmentId = Number(sessionStorage.getItem("DepartmentId"));

  this.loadPolicyCategories();

  this.getPolicies();

}
  loadPolicyCategories() {

  const companyId = Number(sessionStorage.getItem("CompanyId"));
  const regionId = Number(sessionStorage.getItem("RegionId"));

  this.adminService
    .getuserPolicyCategories(companyId, regionId)
    .subscribe({

      next: (res: any) => {

        console.log("Policy Categories:", res);

        this.policyCategories = res;

      },

      error: (err) => {

        console.error(err);

      }

    });

}

  // -----------------------------
  // Get Policies
  // -----------------------------
  getPolicies() {

    this.adminService.getTodayPolicies(this.userId)
      .subscribe((res: any[]) => {

        console.log("Policy API Response:", res)

        this.policies = res.map(p => ({

          Title: p.policyTitle,
          Category: p.category,
          EffectiveDate: new Date(p.effectiveDate),
          Description: p.policyDescription,
          FileName: p.fileName,
          FileUrl: p.fileUrl,
          DepartmentId: Number(p.departmentId)

        }))


        this.filterTodayPolicies()

      })

  }

  
  // -----------------------------
  // Show Today's Policies
  // -----------------------------
  filterTodayPolicies() {

    const today = new Date().toDateString()

    this.filteredPoliciesList = this.policies.filter(p => {

      const policyDate = new Date(p.EffectiveDate).toDateString()

      return (
        p.DepartmentId === this.userDepartmentId &&
        policyDate === today
      )

    })

  }

  // -----------------------------
  // Apply Filter
  // -----------------------------
  applyFilter() {

    this.filteredPoliciesList = this.policies.filter(p => {

      const policyDate = new Date(p.EffectiveDate)

      const matchDept =
        p.DepartmentId === this.userDepartmentId

      const matchCategory =
        this.selectedCategory
          ? p.Category === this.selectedCategory
          : true

      const matchFrom =
        this.fromDate
          ? policyDate >= new Date(this.fromDate)
          : true

      const matchTo =
        this.toDate
          ? policyDate <= new Date(this.toDate)
          : true

      return matchDept && matchCategory && matchFrom && matchTo

    })

  }
}
