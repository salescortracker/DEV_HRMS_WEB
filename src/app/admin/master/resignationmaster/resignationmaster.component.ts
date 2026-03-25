import { Component, OnInit } from '@angular/core';
import { AdminService,Company,Region,ResignationModel } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-resignationmaster',
  standalone: false,
  templateUrl: './resignationmaster.component.html',
  styleUrl: './resignationmaster.component.css'
})
export class ResignationmasterComponent {

  resignations: ResignationModel[] = [];
  resignation!: ResignationModel;

  companies: Company[] = [];
  regions: Region[] = [];

  companyMap: Record<number, string> = {};
  regionMap: Record<number, string> = {};

  searchText = '';
  userId!: number;
  companyId!: number;
  regionId!: number;

  isEditMode = false;

  constructor(private adminService: AdminService, private spinner: NgxSpinnerService) {}

  ngOnInit(): void {
    this.userId = Number(sessionStorage.getItem('UserId'));
    this.companyId = Number(sessionStorage.getItem('CompanyId'));
    this.regionId = Number(sessionStorage.getItem('RegionId'));

    this.resignation = {
      resignationId: 0,
      companyId: this.companyId,
      regionId: this.regionId,
      resignationType: '',
      noticePeriodDays: 0,
      isActive: true
    };

    this.loadCompanies();
    this.loadResignations();
  }

  loadResignations() {
    this.spinner.show();
    this.adminService.getResignations(this.companyId, this.regionId).subscribe({
      next: (res: any) => {
        this.resignations = res || [];
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Failed to load resignations', 'error');
      }
    });
  }

  onSubmit() {
    this.resignation.companyId = this.companyId;
    this.resignation.regionId = this.regionId;

    const formData = new FormData();
    formData.append('resignationType', this.resignation.resignationType);
    formData.append('noticePeriodDays', this.resignation.noticePeriodDays.toString());
    formData.append('companyId', this.companyId.toString());
    formData.append('regionId', this.regionId.toString());
    formData.append('isActive', String(this.resignation.isActive));

    this.spinner.show();

    const obs = this.isEditMode
      ? this.adminService.updateResignation(this.resignation.resignationId, formData, this.userId)
      : this.adminService.createResignation(formData, this.userId);

    obs.subscribe({
      next: () => {
        this.spinner.hide();
        Swal.fire(
          this.isEditMode ? 'Updated!' : 'Added!',
          `Resignation ${this.isEditMode ? 'updated' : 'created'} successfully.`,
          'success'
        );
        this.loadResignations();
        this.clearForm();
      },
      error: () => {
        this.spinner.hide();
        Swal.fire('Error', 'Operation failed.', 'error');
      }
    });
  }

  editResignation(r: ResignationModel) {
    this.resignation = { ...r };
    this.companyId = r.companyId;
    this.regionId = r.regionId;
    this.isEditMode = true;
  }

  deleteResignation(r: ResignationModel) {
    Swal.fire({
      title: `Delete "${r.resignationType}"?`,
      icon: 'warning',
      showCancelButton: true
    }).then(result => {
      if (result.isConfirmed) {
        this.spinner.show();
        this.adminService.deleteResignation(r.resignationId, this.userId).subscribe({
          next: () => {
            this.spinner.hide();
            Swal.fire('Deleted!', 'Deleted successfully.', 'success');
            this.loadResignations();
          },
          error: () => {
            this.spinner.hide();
            Swal.fire('Error', 'Delete failed.', 'error');
          }
        });
      }
    });
  }

  filteredResignations() {
    const s = this.searchText.toLowerCase();
    return this.resignations.filter(x =>
      x.resignationType.toLowerCase().includes(s)
    );
  }

  loadCompanies() {
    this.adminService.getCompanies(null, this.userId).subscribe({
      next: (res: Company[]) => {
        this.companies = res || [];
        this.companies.forEach(c => this.companyMap[c.companyId] = c.companyName);
        this.loadRegions();
      }
    });
  }

  loadRegions() {
    this.adminService.getRegions(null, this.userId).subscribe({
      next: (res: Region[]) => {
        this.regions = res.filter(r => r.companyID == this.companyId);
        this.regions.forEach(r => this.regionMap[r.regionID] = r.regionName);
      }
    });
  }

  clearForm() {
    this.resignation = {
      resignationId: 0,
      companyId: this.companyId,
      regionId: this.regionId,
      resignationType: '',
      noticePeriodDays: 0,
      isActive: true
    };
    this.isEditMode = false;
  }
}
