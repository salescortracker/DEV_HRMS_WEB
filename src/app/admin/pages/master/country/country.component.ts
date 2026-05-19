import { Component } from '@angular/core';
import {
  AdminService,
  Company,
  Region
} from '../../../servies/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

export interface Country {
  countryId: number;
  countryName: string;
  companyId: number;
  regionId: number;
  isActive: boolean;
  userId?: number;
}

@Component({
  selector: 'app-country',
  standalone: false,
  templateUrl: './country.component.html',
  styleUrl: './country.component.css'
})
export class CountryComponent {
 countryList: Country[] = [];
  country!: Country;

  allRegions: Region[] = [];
  regions: Region[] = [];

  companies: Company[] = [];

  companyMap: Record<number, string> = {};
  regionMap: Record<number, string> = {};

  isEditMode = false;

  searchText = '';

  pageSize = 5;
  currentPage = 1;

  userId = Number(sessionStorage.getItem('UserId')) || 0;

  constructor(
    private adminService: AdminService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.country = this.getEmptyCountry();

    this.loadCompanies();
    this.loadRegions();
    this.loadCountries();
  }

  getEmptyCountry(): Country {
    return {
      countryId: 0,
      countryName: '',
      companyId: 0,
      regionId: 0,
      isActive: true,
      userId: this.userId
    };
  }

  loadCompanies() {
    this.adminService.getCompanies(null, this.userId).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];

        this.companies = data.filter((c: any) => c.isActive);

        this.companyMap = {};

        this.companies.forEach((c: any) => {
          this.companyMap[c.companyId] = c.companyName;
        });
      }
    });
  }

  loadRegions() {
    this.adminService.getRegions(null, this.userId).subscribe({
      next: (res: any) => {
        const data = res?.data ?? res ?? [];

        this.allRegions = data.filter((r: any) => r.isActive);

        this.regionMap = {};

        this.allRegions.forEach((r: any) => {
          this.regionMap[r.regionID] = r.regionName;
        });
      }
    });
  }

  loadCountries() {
    this.spinner.show();

    this.adminService.getCountries(this.userId).subscribe({
      next: (res: any) => {
        this.countryList = res.data || res;
        this.spinner.hide();
      },
      error: () => {
        this.spinner.hide();
      }
    });
  }

  onCompanyChange() {
    this.country.regionId = 0;

    this.regions = this.allRegions.filter(
      r => r.companyID == this.country.companyId
    );
  }

  onSubmit() {

    this.country.userId = this.userId;

    const obs = this.isEditMode
      ? this.adminService.updateCountry(this.country)
      : this.adminService.createCountry(this.country);

    obs.subscribe({
      next: (res: any) => {

        if (!res.success) {
          Swal.fire('Warning', 'Record already exists', 'warning');
          return;
        }

        Swal.fire('Success', res.message, 'success');

        this.loadCountries();

        this.resetForm();
      },

      error: () => {
        Swal.fire('Error', 'Operation failed', 'error');
      }
    });
  }

  editCountry(item: Country) {

    this.country = { ...item };

    this.regions = this.allRegions.filter(
      r => r.companyID == item.companyId
    );

    this.isEditMode = true;
  }

  deleteCountry(item: Country) {

    Swal.fire({
      title: 'Delete this country?',
      icon: 'warning',
      showCancelButton: true
    }).then(result => {

      if (result.isConfirmed) {

        this.adminService.deleteCountry(item.countryId)
          .subscribe(() => {

            this.loadCountries();
          });
      }
    });
  }

  resetForm() {

    this.country = this.getEmptyCountry();

    this.regions = [];

    this.isEditMode = false;
  }

  filteredCountries() {

    return this.countryList.filter(x =>
      x.countryName.toLowerCase()
      .includes(this.searchText.toLowerCase())
    );
  }

  get pagedCountries() {

    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredCountries()
      .slice(start, start + this.pageSize);
  }
}
