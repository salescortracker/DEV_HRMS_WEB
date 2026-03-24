import { Component, OnInit } from '@angular/core';
import { AdminService,Company,PolicyCategory, Region } from '../../../servies/admin.service'; 
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
@Component({
  selector: 'app-policy-category',
  standalone: false,
  templateUrl: './policy-category.component.html',
  styleUrl: './policy-category.component.css'
})
export class PolicyCategoryComponent {
    
  searchText = '';
  categories: PolicyCategory[] = [];
  category!: PolicyCategory;

  companies: Company[] = [];
  regions: Region[] = [];

  companyMap: Record<number, string> = {};
  regionMap: Record<number, string> = {};

  userId!: number;
  companyId!: number;
  regionId!: number;

  isEditMode = false;

  constructor(private adminService: AdminService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem("UserId"));
    this.companyId = Number(sessionStorage.getItem("CompanyId"));
    this.regionId = Number(sessionStorage.getItem("RegionId"));

    this.category = {
      PolicyCategoryID: 0,
      CompanyID: this.companyId,
      RegionID: this.regionId,
      PolicyCategoryName: '',
      Description: '',
      IsActive: true
    };

    this.loadCompanies();
    this.loadCategories();
  }

  loadCategories() {
    this.spinner.show();

    this.adminService.getPolicyCategories(this.userId).subscribe({
      next: (res: any) => {
        const data = res.data || [];
        this.categories = data.map((x: any) => ({
          PolicyCategoryId: x.policyCategoryId,
          CompanyId: x.companyId,
          RegionId: x.regionId,
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

  onSubmit() {
    this.category.CompanyID= this.companyId;
    this.category.RegionID = this.regionId;
    this.category.UserId = this.userId;

    this.spinner.show();

    const obs = this.isEditMode
      ? this.adminService.updatePolicyCategory(this.category)
      : this.adminService.createPolicyCategory(this.category);

    obs.subscribe({
      next: () => {
        this.spinner.hide();
        Swal.fire(
          this.isEditMode ? 'Updated!' : 'Added!',
          `Policy Category ${this.isEditMode ? 'updated' : 'created'} successfully.`,
          'success'
        );
        this.loadCategories();
        this.clearForm();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Operation failed.', 'error');
      }
    });
  }

  editCategory(c: PolicyCategory) {
    this.category = { ...c };

    this.companyId = c.CompanyID;
    this.regionId = c.RegionID;

    this.loadRegions();
    this.isEditMode = true;
  }

  deleteCategory(c: PolicyCategory) {
    Swal.fire({
      title: `Delete "${c.PolicyCategoryName}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deletePolicyCategory(c.PolicyCategoryID).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted!', 'Deleted successfully.', 'success');
            this.loadCategories();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed.', 'error');
          }
        });
      }
    });
  }

  filteredCategories(): PolicyCategory[] {
    const s = this.searchText.toLowerCase();
    return this.categories.filter(x =>
      x.PolicyCategoryName.toLowerCase().includes(s)
    );
  }

loadCompanies() {
  this.adminService.getCompanies(null, this.userId).subscribe({
    next: (res: any) => {
      console.log('All Companies 👉', res);

      const data = res?.data ?? res ?? [];

      // 🔥 Only active companies
      this.companies = data.filter((c: any) => c.isActive === true);

      // ✅ Build map from active only
      this.companyMap = {};
      this.companies.forEach((c: any) => {
        this.companyMap[c.companyId] = c.companyName;
      });

      console.log('Active Companies 👉', this.companies);

      // ✅ Load regions after companies
      this.loadRegions();
    }
  });
}

 loadRegions() {
  this.adminService.getRegions(null, this.userId).subscribe({
    next: (res: any) => {
      console.log('All Regions 👉', res);

      const data = res?.data ?? res ?? [];

      // 🔥 Only active regions
      const activeRegions = data.filter((r: any) => r.isActive === true);

      // ✅ Build map from active regions
      this.regionMap = {};
      activeRegions.forEach((r: any) => {
        this.regionMap[r.regionID] = r.regionName;
      });

      // ✅ Filter by selected company
      this.regions = activeRegions.filter(
        (r: any) => r.companyID == this.companyId
      );

      console.log('Filtered Regions 👉', this.regions);

      // ✅ Auto-select region if not selected
      if (!this.regionId && this.regions.length > 0) {
        this.regionId = this.regions[0].regionID;
      }

      this.category.RegionID = this.regionId;
    }
  });
}

  clearForm() {
    this.category = {
      PolicyCategoryID: 0,
      CompanyID: this.companyId,
      RegionID: this.regionId,
      PolicyCategoryName: '',
      Description: '',
      IsActive: true
    };
    this.isEditMode = false;
  }
}
