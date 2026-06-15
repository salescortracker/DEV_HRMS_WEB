import { Component, Input, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { AdminService,User, Company, Region, RoleMaster } from '../admin/servies/admin.service';
@Component({
  selector: 'app-main-users',
  standalone: false,
  templateUrl: './main-users.component.html',
  styleUrl: './main-users.component.css'
})
export class MainUsersComponent implements OnInit {
  @Input() candidateName: string = '';
  @Input() joiningDate: string = '';
 users: User[] = [];
  companies: Company[] = [];
  regions: Region[] = [];
  roles: RoleMaster[] = [];
  totalCount: number = 0;
  user: User = this.getEmptyUser();
  isEditMode = false;
departments: any[] = [];
userId: number = sessionStorage.getItem('userCompanyId') ? Number(sessionStorage.getItem('userCompanyId')) : 0;
companyId: number = sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : 0;
regionId: number = sessionStorage.getItem('RegionId') ? Number(sessionStorage.getItem('RegionId')) : 0;
filteredRegions: any[] = [];
filteredRoles: RoleMaster[] = [];
filteredDepartments: any[] = [];
hrUsers: any[] = [];
filteredHrUsers: any[] = [];
reportingToUsers: any[] = [];

designations: any[] = [];
filteredDesignations: any[] = [];
  constructor(private userService: AdminService) {}

  ngOnInit(): void {
    if (this.candidateName) {
    this.user.fullName = this.candidateName;
  }

  if (this.joiningDate) {
    this.user.joiningDate = this.joiningDate;
  }
    this.generateNextEmployeeCode();
    this.loadCompanies();
    this.loadRegions();
    this.loadRoles();
    this.loadDepartments();
    this.loadDesignations();
  }
loadDepartments(): void {

  this.userService.getDepartments(this.userId).subscribe({
    next: (res: any) => {

      this.departments =
        (res?.data?.data ?? []).filter((d: any) => d.isActive);

      this.filterDepartments();
    },
    error: () => {
      this.showError('Failed to load departments.');
    }
  });

}
loadDesignations(): void {
  this.userService.getDesignations(this.userId).subscribe({
    next: (res: any) => {
      this.designations = res?.data?.data ?? [];
      this.filterDesignations();
    },
    error: () => this.showError('Failed to load designations.')
  });
}

filterDesignations(): void {

  if (
    !this.user.companyId ||
    !this.user.regionId ||
    !this.user.departmentId
  ) {
    this.filteredDesignations = [];
    return;
  }

  this.filteredDesignations = this.designations.filter(d =>
    Number(d.companyID) === Number(this.user.companyId) &&
    Number(d.regionID) === Number(this.user.regionId) &&
    Number(d.departmentID) === Number(this.user.departmentId)
  );
}

onDepartmentChange(departmentId: number): void {

  this.user.designationId = 0;
  this.filterDesignations();

}
  getEmptyUser(): User {
  return {
    userId: 0,
    companyId: 0,
    regionId: 0,
    employeeCode: '',
    fullName: '',
    email: '',
    roleId: 0,
    departmentId: 0,
    designationId: 0,
    reportingTo: 0,
    reportingHr: 0,
    joiningDate: '',
    password: '',
    status: 'Active',
    userCompanyId: sessionStorage.getItem('UserId')
      ? Number(sessionStorage.getItem('UserId'))
      : 0,
    loginType: ''
  };
}
loadReportingToUsers(companyId: number, regionId: number): void {

  this.userService
    .getUsersByCompanyRegion(companyId, regionId)
    .subscribe({
      next: (res: any) => {
        this.reportingToUsers = res;
      }
    });

}

loadHrUsers(companyId: number, regionId: number): void {

  this.userService
    .getHrUsers(companyId, regionId)
    .subscribe({
      next: (res: any[]) => {

        this.filteredHrUsers = res.filter(x =>
          x.designationName?.toLowerCase().includes('human resource') ||
          x.designationName?.toLowerCase().includes('hr')
        );

      }
    });

}

onStatusChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.user.status = input?.checked ? 'Active' : 'Inactive';
  }

  onCompanyChange(companyId: number): void {
    this.user.regionId = 0;
    this.user.roleId = 0;
    this.user.departmentId = 0;
    this.filteredRegions = companyId
    ? this.regions.filter(r => Number(r.companyID) === Number(companyId))
    : [];
    this.filteredRoles = [];
    this.filteredDepartments = [];
    this.generateNextEmployeeCode();
  }
 onRegionChange(regionId: number): void {

  this.user.roleId = 0;
  this.user.departmentId = 0;
  this.user.designationId = 0;

  if (!this.user.companyId || !regionId) {
    this.filteredRoles = [];
    this.filteredDepartments = [];
    this.filteredDesignations = [];
    return;
  }

  this.userService
    .getUsersByCompanyRegion(this.user.companyId, regionId)
    .subscribe({
      next: (res: any[]) => {

        this.users = res; // 🔥 Employee Code generation kosam

        this.generateNextEmployeeCode();

        this.reportingToUsers = res;
      }
    });

  this.filterDepartments();
  this.loadHrUsers(this.user.companyId, regionId);

  this.filteredDesignations = [];
}
filterDepartments(): void {
  if (!this.user.companyId || !this.user.regionId) {
    this.filteredDepartments = [];
    return;
  }

  this.filteredDepartments = this.departments.filter(d =>
    Number(d.companyId) === Number(this.user.companyId) &&
    Number(d.regionId) === Number(this.user.regionId)
  );

  console.log("Filtered Departments:", this.filteredDepartments);
}

    loadCompanies(): void {
      this.userService.getCompanies(null,this.userId).subscribe({
        next: (res:any) => (this.companies = res),
        error: () => Swal.fire('Error', 'Failed to load companies.', 'error')
      });
    }
  
    loadRegions(): void {
      this.userService.getRegions(null, this.userId).subscribe({
      next: (res: any) => {
        this.regions = res;
        this.filteredRegions = [];
      },
      error: () => Swal.fire('Error', 'Failed to load regions.', 'error')
    });
    }

  loadRoles(): void {
  if (!this.userId) {
    Swal.fire('Error', 'Invalid User Id', 'error');
    return;
  }

  this.userService.getroles(this.userId).subscribe({
    next: (roles: RoleMaster[]) => {
      
      this.roles = roles;
      this.totalCount = roles.length;
    },
    error: (err) => {
      console.error(err);
      Swal.fire('Error', 'Failed to load roles.', 'error');
    }
  });
}

 generateNextEmployeeCode(): void {

  if (!this.user.companyId || !this.user.regionId) {
    this.user.employeeCode = '';
    return;
  }

  const filteredUsers = this.users.filter(u =>
    Number(u.companyId) === Number(this.user.companyId) &&
    Number(u.regionId) === Number(this.user.regionId)
  );

  if (filteredUsers.length === 0) {
    this.user.employeeCode = 'EMP0001';
    return;
  }

  const numericCodes = filteredUsers
    .map(u => {
      const match = u.employeeCode?.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter(num => num > 0);

  const maxCode =
    numericCodes.length > 0
      ? Math.max(...numericCodes)
      : 0;

  const nextCode = maxCode + 1;

  this.user.employeeCode =
    `EMP${nextCode.toString().padStart(4, '0')}`;
}

  onSubmit(): void {
    if (this.isEditMode) {
      this.userService.updateUser(this.user).subscribe({
        next: () => {
          this.showSuccess('User updated successfully!');
          this.resetForm();
        },
        error: () => this.showError('Failed to update user.')
      });
    } else {

      this.userService.createUser(this.user).subscribe({
        next: () => {
          this.showSuccess('User created successfully. Welcome email sent!');
          this.resetForm();
        },
        error: () => this.showError('Failed to create user.')
      });
    }
  }

  generateFormPassword(): void {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#';
    this.user.password = Array.from({ length: 10 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
  }

  resetForm(): void {
    this.user = this.getEmptyUser();
    this.isEditMode = false;
  }

 
  showSuccess(msg: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: msg,
      timer: 2000,
      showConfirmButton: false
    });
  }

  showError(msg: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: msg,
      timer: 2500,
      showConfirmButton: false
    });
  }
}
