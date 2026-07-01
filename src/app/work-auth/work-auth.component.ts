import { Component } from '@angular/core';
import { AdminService, Company, Region } from '../admin/servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

export interface WorkAuthStatus {
  StatusId: number;
  CompanyId: number;
  RegionId: number;
  StatusName: string;
  IsActive: boolean;
  UserId?: number;
}

@Component({
  selector: 'app-work-auth',
  standalone: false,
  templateUrl: './work-auth.component.html',
  styleUrl: './work-auth.component.css'
})
export class WorkAuthComponent {
  searchText = '';
  statusList: WorkAuthStatus[] = [];
  statusModel: WorkAuthStatus = {
    StatusId: 0,
    CompanyId: 0,
    RegionId: 0,
    StatusName: '',
    IsActive: true,
    UserId: 0
  };

  companies: Company[] = [];
  regions: Region[] = [];
  companyMap: Record<number, string> = {};
  regionMap: Record<number, string> = {};

  userId!: number;
  companyId!: number;
  regionId!: number;
  isEditMode = false;
  page = 1;
pageSize = 5;
pageSizeOptions = [5, 10, 25, 50];

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem('UserId'));
    this.companyId = Number(sessionStorage.getItem('CompanyId'));
    this.regionId = Number(sessionStorage.getItem('RegionId'));

    if (!this.userId) {
      console.error('UserId missing in sessionStorage');
      return;
    }

    this.statusModel = {
      StatusId: 0,
      CompanyId: this.companyId,
      RegionId: this.regionId,
      StatusName: '',
      IsActive: true,
      UserId: this.userId
    };

    this.loadCompanies();
    this.loadStatuses();
  }

  loadStatuses(): void {
    if (!this.userId) {
      return;
    }

    this.spinner.show();

    this.adminService.getWorkAuthStatuses(this.companyId, this.regionId, this.userId).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

        this.statusList = data.map((item: any) => ({
          StatusId: item.statusId ?? item.StatusId,
          CompanyId: item.companyId ?? item.CompanyId,
          RegionId: item.regionId ?? item.RegionId,
          StatusName: item.statusName ?? item.StatusName,
          IsActive: item.isActive ?? item.IsActive ?? true,
          UserId: item.userId ?? item.UserId
        }));

        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load work auth statuses', 'error');
      }
    });
  }

  onSubmit(): void {
    if (!this.statusModel.StatusName?.trim()) {
      Swal.fire('Warning', 'Status name is required', 'warning');
      return;
    }

    this.statusModel.CompanyId = this.companyId;
    this.statusModel.RegionId = this.regionId;
    this.statusModel.UserId = this.userId;

    this.spinner.show();

    const request = this.isEditMode
      ? this.adminService.updateWorkAuthStatus(this.statusModel)
      : this.adminService.createWorkAuthStatus(this.statusModel);

    request.subscribe({
      next: (res: any) => {
        this.spinner.hide();

        if (!res.success) {
          Swal.fire({
            icon: 'warning',
            title: 'Duplicate Record',
            text: res.message
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          title: this.isEditMode ? 'Updated!' : 'Added!',
          text: res.message
        });

        this.loadStatuses();
        this.clearForm();
      },

      error: (err) => {
        this.spinner.hide();

        Swal.fire({
          icon: 'warning',
          title: 'Duplicate Record',
          text: err.error?.message || 'Operation failed.'
        });
      }
    });
  }

  editStatus(item: WorkAuthStatus): void {
    this.statusModel = { ...item };
    this.companyId = item.CompanyId;
    this.regionId = item.RegionId;
    this.loadRegions();
    this.isEditMode = true;
  }

  deleteStatus(item: WorkAuthStatus): void {
    Swal.fire({
      title: 'Delete this status?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();

        this.adminService.deleteWorkAuthStatus(item.StatusId, this.companyId, this.regionId, this.userId).subscribe({
          next: (res: any) => {
            this.spinner.hide();
            const message = res?.message || 'Work auth status deleted successfully.';
            Swal.fire('Deleted!', message, 'success');
            this.loadStatuses();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed.', 'error');
          }
        });
      }
    });
  }

  filteredStatuses(): WorkAuthStatus[] {
    const search = this.searchText?.toLowerCase() || '';

    return this.statusList.filter(item =>
      item.StatusName?.toLowerCase().includes(search)
    )
     .sort((a, b) => b.StatusId - a.StatusId); // Latest first
  }

  loadCompanies(): void {
    this.adminService.getCompanies(null, this.userId).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
        this.companies = data.filter((item: any) => item.isActive === true);

        this.companyMap = {};
        this.companies.forEach((item: any) => {
          this.companyMap[item.companyId] = item.companyName;
        });

        if (this.companyId) {
          this.loadRegions();
        }
      },
      error: () => Swal.fire('Error', 'Failed to load companies', 'error')
    });
  }

  loadRegions(): void {
    this.adminService.getRegions(null, this.userId).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];
        const activeRegions = data.filter((item: any) => item.isActive === true);

        this.regionMap = {};
        activeRegions.forEach((item: any) => {
          this.regionMap[item.regionID] = item.regionName;
        });

        this.regions = activeRegions.filter((item: any) => item.companyID == this.companyId);

        if (!this.regionId && this.regions.length > 0) {
          this.regionId = this.regions[0].regionID;
        }

        this.statusModel.RegionId = this.regionId;
      },
      error: () => Swal.fire('Error', 'Failed to load regions', 'error')
    });
  }

  onCompanyChange(): void {
    sessionStorage.setItem('CompanyId', this.companyId.toString());
    this.statusModel.CompanyId = this.companyId;
    this.regionId = 0;
    this.regions = [];
    this.loadRegions();
  }

  onRegionChange(): void {
    sessionStorage.setItem('RegionId', this.regionId.toString());
    this.statusModel.RegionId = this.regionId;
  }

  clearForm(): void {
    this.statusModel = {
      StatusId: 0,
      CompanyId: this.companyId,
      RegionId: this.regionId,
      StatusName: '',
      IsActive: true,
      UserId: this.userId
    };
    this.isEditMode = false;
  }

  paginatedStatuses(): WorkAuthStatus[] {
  const data = this.filteredStatuses();

  const start = (this.page - 1) * this.pageSize;
  return data.slice(start, start + this.pageSize);
}

totalPages(): number {
  return Math.ceil(this.filteredStatuses().length / this.pageSize);
}

changePage(page: number) {
  if (page >= 1 && page <= this.totalPages()) {
    this.page = page;
  }
}

changePageSize() {
  this.page = 1;
}
}
