import { Component, OnInit } from '@angular/core';
import { AdminService, Company, Region } from '../../servies/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-accounttype',
  standalone: false,
  templateUrl: './accounttype.component.html',
  styleUrls: ['./accounttype.component.css']
})
export class AccounttypeComponent implements OnInit {

  accountTypes: any[] = [];
  companies: Company[] = [];
  regions: Region[] = [];
  allRegions: Region[] = [];
  searchText: string = '';
  companyMap: Record<number, string> = {};
  regionMap: Record<number, string> = {};
  account: any = this.getEmptyAccount();
  isEditMode = false;

  userId = Number(sessionStorage.getItem('UserId'));
  companyId = Number(sessionStorage.getItem('CompanyId'));
  regionId = Number(sessionStorage.getItem('RegionId'));

  constructor(private service: AdminService) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadRegions();

    setTimeout(() => {
      this.loadAccountTypes();
      if (this.account.companyId) {
        this.onCompanyChange();
      }
    }, 200);
  }

  getEmptyAccount() {
    return {
      accountTypeId: 0,
      accountType1: '',
      description: '',
      companyId: this.companyId,
      regionId: this.regionId,
      isActive: true,
      userId: this.userId
    };
  }

  // 🔹 Load Account Types
  loadAccountTypes() {
    this.service.getAccountTypeList(this.userId).subscribe((res: any) => {
      const data = res.data || res || [];
      this.accountTypes = Array.isArray(data) ? data : [];
    });
  }

  // 🔹 Load Dropdowns
  loadCompanies() {
    this.service.getCompanies(null, this.userId).subscribe((res: any) => {
      const data = res.data || res;
      this.companies = data.filter((x: any) => x.isActive);

      this.companyMap = {};
      this.companies.forEach((c: any) => {
        this.companyMap[c.companyId] = c.companyName;
      });
    });
  }

  loadRegions() {
    this.service.getRegions(null, this.userId).subscribe((res: any) => {
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      this.allRegions = data.filter((x: any) => x.isActive !== false);

      this.regionMap = {};
      this.allRegions.forEach((r: any) => {
        this.regionMap[r.regionID] = r.regionName;
      });

      this.regions = [];
      if (this.account.companyId) {
        this.onCompanyChange();
      }
    });
  }

  onCompanyChange() {
    const companyId = Number(this.account?.companyId || 0);
    this.account.regionId = 0;

    if (!companyId) {
      this.regions = [];
      return;
    }

    // First use the already loaded region list for a reliable company filter.
    this.regions = this.allRegions.filter(
      (r: any) => Number(r.companyID) === Number(companyId)
    );

    // Then try the dedicated API result to refresh the list if available.
    this.service.getRegionsByCompany(companyId).subscribe((res: any) => {
      const data = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
          ? res
          : [];

      if (data.length > 0) {
        this.regions = data
          .filter((x: any) => x.isActive !== false)
          .map((x: any) => ({
            ...x,
            regionID: Number(x.regionID ?? x.regionId ?? x.RegionID ?? x.RegionId),
            regionName: x.regionName ?? x.RegionName,
            companyID: Number(x.companyID ?? x.companyId ?? x.CompanyID ?? x.CompanyId)
          }));
      }
    });
  }

  onSubmit() {
  this.account.userId = this.userId;

  if (
    !this.account.accountType1?.trim() ||
    this.account.companyId === null ||
    this.account.regionId === null
  ) {
    Swal.fire('Error', 'Please fill required fields', 'error');
    return;
  }
  if (this.isEditMode) {
      this.service.updateAccountType(this.account).subscribe({
        next: () => {
          Swal.fire('Updated!', 'Account Type updated', 'success');
          this.loadAccountTypes();
          this.resetForm();
        },
        error: (err) => {
          Swal.fire('Error', err.error?.message || 'Duplicate Account Type', 'error');
        }
      });
  } else {
    this.service.createAccountType(this.account).subscribe({
      next: () => {
        Swal.fire('Added!', 'Account Type created', 'success');
        this.loadAccountTypes();
        this.resetForm();
      },
      error: (err) => {
        Swal.fire('Error', err.error?.message || 'Duplicate Account Type', 'error');
      }
    });
  }
}

  // 🔹 Edit
  editAccount(a: any) {
    this.account = {
      ...a,
      companyId: Number(a.companyId),
      regionId: Number(a.regionId)
    };

    if (this.account.companyId) {
      this.onCompanyChange();
      setTimeout(() => {
        this.account.regionId = Number(a.regionId || 0);
      }, 0);
    }

    this.isEditMode = true;
  }

  // 🔹 Delete
  deleteAccount(a: any) {
    Swal.fire({
      title: `Delete "${a.accountType1}"?`,
      icon: 'warning',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteAccountType(a.accountTypeId).subscribe(() => {
          Swal.fire('Deleted!', 'Account Type removed', 'success');
          this.loadAccountTypes();
        });
      }
    });
  }

  // 🔹 Reset
  resetForm() {
    this.account = this.getEmptyAccount();
    this.isEditMode = false;
  }

  getCompanyName(id: number) {
    const value = Number(id);
    return (
      this.companyMap[value] ||
      this.companies.find(x => Number(x.companyId) === value)?.companyName ||
      this.accountTypes.find((x: any) => Number(x.companyId) === value)?.companyName ||
      '-'
    );
  }

  getRegionName(id: number) {
    const value = Number(id);
    return (
      this.regionMap[value] ||
      this.allRegions.find(x => Number(x.regionID) === value)?.regionName ||
      this.accountTypes.find((x: any) => Number(x.regionId ?? x.regionID) === value)?.regionName ||
      '-'
    );
  }


  get filteredAccountTypes() {
  if (!this.searchText) {
    return this.accountTypes;
  }

  const search = this.searchText.toLowerCase();

  return this.accountTypes.filter((x: any) =>
    x.accountType1?.toLowerCase().includes(search) ||
    x.description?.toLowerCase().includes(search)
  );
}
}