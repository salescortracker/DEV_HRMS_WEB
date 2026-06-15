import { Component } from '@angular/core';
import { AdminService, User, Company, Region, RoleMaster } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-users',
  standalone: false,
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  users: User[] = [];
  companies: Company[] = [];
  regions: Region[] = [];
  roles: RoleMaster[] = [];
  totalCount: number = 0;
  user: User = this.getEmptyUser();
  isEditMode = false;
  departments: any[] = [];
  userId: number = sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0;
  companyId: number = sessionStorage.getItem('CompanyId') ? Number(sessionStorage.getItem('CompanyId')) : 0;
  regionId: number = sessionStorage.getItem('RegionId') ? Number(sessionStorage.getItem('RegionId')) : 0;
  filteredRegions: any[] = [];
  filterRegions: Region[] = [];
  filteredRoles: RoleMaster[] = [];
  filteredDepartments: any[] = [];
  reportingManagers: User[] = [];
  filter = {
    employeeName: '',
    companyId: 0,
    regionId: 0
  };
  hrUsers: any[] = [];
  filteredHrUsers: any[] = [];
  reportingToUsers: any[] = [];

  designations: any[] = [];
  filteredDesignations: any[] = [];

  filteredUsers: User[] = [];
  constructor(private userService: AdminService) {}

  ngOnInit(): void {
    this.generateNextEmployeeCode();
    this.loadUsersForListing();
    this.loadCompanies();
    this.loadRegions();
    this.loadRoles();
    this.loadDepartments();
    this.loadDesignations();
  }

  loadDepartments(): void {
  this.userService.getDepartments(this.userId).subscribe({
    next: (res: any) => {
      this.departments = (res?.data?.data ?? []).filter((d: any) => d.isActive);

      this.filterDepartments(); // 🔥 ADD THIS
    }
  });
}

loadDesignations(): void {
  this.userService.getDesignations(this.userId).subscribe({
    next: (res: any) => {
      console.log('Desugnations For User Creation',res);
      this.designations = res?.data?.data ?? [];
      this.filterDesignations(); // 🔥 important
    },
    error: () => this.showError('Failed to load designations.')
  });
}

loadHrUsers(companyId: number, regionId: number): void {
  this.userService.getHrUsers(companyId, regionId)
    .subscribe(res => {

      this.filteredHrUsers = res.filter(x =>
        x.designationName?.toLowerCase().includes('hr') ||
        x.designationName?.toLowerCase().includes('human resource')
      );

      // 🔥 SAME LIKE DESIGNATION BIND
      if (this.isEditMode) {
        this.user.reportingHr = Number(this.user.reportingHr);
      }
    });
}
loadReportingToUsers(companyId: number, regionId: number): void {
  this.userService.getUsersByCompanyRegion(companyId, regionId)
    .subscribe(res => {

      this.reportingToUsers = res;

      // 🔥 NOW bind like department/designation style
      if (this.isEditMode) {
        this.user.reportingTo = Number(this.user.reportingTo);
      }
    });
}
filterDesignations(): void {
  if (!this.user.companyId || !this.user.regionId || !this.user.departmentId) {
    this.filteredDesignations = [];
    return;
  }

  this.filteredDesignations = this.designations.filter(d =>
    Number(d.companyID) === Number(this.user.companyId) &&
    Number(d.regionID) === Number(this.user.regionId) &&
    Number(d.departmentID) === Number(this.user.departmentId)   // ✅ FIX HERE
  );

  console.log("Filtered Designations:", this.filteredDesignations);
}

//========================= Designations based on selected departments ========================================

onDepartmentChange(departmentId: number): void {
  this.user.designationId = 0;   // reset designation
  this.filterDesignations();     // reload based on department
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
      departmentId:0,
      designationId: 0,
      reportingTo:0,
      password: '',
      reportingHr: 0,        
      joiningDate: '',
      status: 'Active',
      userCompanyId:sessionStorage.getItem('UserId') ? Number(sessionStorage.getItem('UserId')) : 0
     , loginType: ''
    };
  }applyFilters(): void {

  if (
    !this.filter.employeeName &&
    !this.filter.companyId &&
    !this.filter.regionId
  ) {
    this.filteredUsers = [...this.users];
  } else {
    this.filteredUsers = this.users.filter(u => {

      const matchesName =
        !this.filter.employeeName ||
        u.fullName.toLowerCase().includes(this.filter.employeeName.toLowerCase());

      const matchesCompany =
        !this.filter.companyId ||
        Number(u.companyId) === Number(this.filter.companyId);

      const matchesRegion =
        !this.filter.regionId ||
        Number(u.regionId) === Number(this.filter.regionId);

      return matchesName && matchesCompany && matchesRegion;
    });
  }

  this.currentPage = 1;      // ✅ RESET PAGE
  this.setPagination();     // ✅ APPLY PAGINATION
  this.loadUsersForListing();
}
onFilterCompanyChange(): void {
  this.filter.regionId = 0;
  // filter regions based on company
  this.filterRegions = this.filter.companyId
    ? this.regions.filter(r => Number(r.companyID) === Number(this.filter.companyId))
    : [...this.regions];

  this.applyFilters();
}
getreporting(id:any)
{
}  
onStatusChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.user.status = input?.checked ? 'Active' : 'Inactive';
  }
  loadUsersForEmployeeCode(): void {

  if (!this.user.companyId || !this.user.regionId) {
    return;
  }

  this.userService
    .getUsersByCompanyRegion(this.user.companyId, this.user.regionId)
    .subscribe({
      next: (res: any[]) => {

        this.users = res.map(u => ({
          ...u,
          companyId: Number(u.companyID),
          regionId: Number(u.regionID),
          employeeCode: u.employeeCode
        }));

        console.log('Employee Count:', this.users.length);
        console.log('Users:', this.users);

        this.generateNextEmployeeCode();
      }
    });
}
loadUsersForListing(): void {
  this.userService.getUsersByCompanyRegion(this.filter.companyId, this.filter.regionId)
    .subscribe({
      next: (res: any[]) => {

        this.filteredUsers = res.map(u => ({
          ...u,
          companyId: Number(u.companyID),   
          regionId: Number(u.regionID),
          reportingHr: Number(u.reportingHR ?? u.reportingHr ?? 0),
          password: u.password || ''
        }));

        this.users = [...this.filteredUsers];
        this.setPagination();
      }
    });
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
    this.filteredDesignations = [];
  }

onRegionChange(regionId: number): void {
  this.user.roleId = 0;
  this.user.departmentId = 0;
  this.user.designationId = 0; // ✅ reset

  if (!this.user.companyId || !regionId) {
    this.filteredRoles = [];
    this.filteredDepartments = [];
    this.filteredDesignations = [];
    return;
  }

  this.filteredRoles = this.roles.filter(r =>
    Number(r.companyId) === Number(this.user.companyId) &&
    Number(r.regionId) === Number(regionId)
  );

  this.filterDepartments();
  this.loadReportingToUsers(this.user.companyId, regionId);
  this.loadHrUsers(this.user.companyId, regionId);

  this.filteredDesignations = [];
  this.loadUsersForEmployeeCode();
  this.generateNextEmployeeCode();
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
        this.filterRegions = [...this.regions];
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

 // 🔹 Auto-generate Employee Code (Frontend only)
 generateNextEmployeeCode(): void {

  // ✅ Only for Create Mode
  if (this.isEditMode) return;

  // ✅ Company + Region mandatory
  if (!this.user.companyId || !this.user.regionId) {
    this.user.employeeCode = '';
    return;
  }

  // ✅ Filter users by Company + Region
  const filteredUsers = this.users.filter(u =>
    Number(u.companyId) === Number(this.user.companyId) &&
    Number(u.regionId) === Number(this.user.regionId)
  );

  // ✅ No Employees
  if (filteredUsers.length === 0) {
    this.user.employeeCode = 'EMP0001';
    return;
  }

  // ✅ Extract numeric values
  const numericCodes = filteredUsers
    .map(u => {
      const match = u.employeeCode?.match(/\d+$/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter(num => num > 0);

  // ✅ Safety check
  const maxCode = numericCodes.length > 0
    ? Math.max(...numericCodes)
    : 0;

  const nextCode = maxCode + 1;

  this.user.employeeCode =
    `EMP${nextCode.toString().padStart(4, '0')}`;
}

  onSubmit(): void {
    if (!this.user.companyId || this.user.companyId === 0) {
    Swal.fire('Validation', 'Please select company', 'warning');
    return;
  }

  if (!this.user.regionId || this.user.regionId === 0) {
    Swal.fire('Validation', 'Please select region', 'warning');
    return;
  }

  if (!this.user.fullName || this.user.fullName.trim() === '') {
    Swal.fire('Validation', 'Please enter full name', 'warning');
    return;
  }
 if (!this.user.email || this.user.email.trim() === '') {
    Swal.fire('Validation', 'Please enter email', 'warning');
    return;
  }

  if (!this.user.roleId || this.user.roleId === 0) {
    Swal.fire('Validation', 'Please select role', 'warning');
    return;
  }

  if (!this.user.departmentId || this.user.departmentId === 0) {
    Swal.fire('Validation', 'Please select department', 'warning');
    return;
  }

  if (!this.user.designationId || this.user.designationId === 0) {
  Swal.fire('Validation', 'Please select designation', 'warning');
  return;
}

 

  if (!this.user.loginType || this.user.loginType.trim() === '') {
    Swal.fire('Validation', 'Please select login type', 'warning');
    return;
  }

  if (!this.user.password || this.user.password.trim() === '') {
    Swal.fire('Validation', 'Please enter password', 'warning');
    return;
  }
    if (this.isEditMode) {
      this.userService.updateUser(this.user).subscribe({
        next: () => {
          this.showSuccess('User updated successfully!');
          this.resetForm();
          this.loadUsersForListing();
          this.loadUsersForEmployeeCode();
        },
        error: () => this.showError('Failed to update user.')
      });
    } else {

      this.userService.createUser(this.user).subscribe({
        next: () => {
          this.showSuccess('User created successfully. Welcome email sent!');
          this.resetForm();
          this.loadUsersForListing();
          this.loadUsersForEmployeeCode();
        },
        error: () => this.showError('Failed to create user.')
      });
    }
  }

  editUser(u: User): void {

  this.isEditMode = true;

  this.user = {
    ...u,
    reportingHr: Number(u.reportingHr || u.reportingHr || 0),
    reportingTo: Number(u.reportingTo || 0),
    password: u.password || ''
  };


  this.user.companyId = u.companyId;
  this.user.regionId = u.regionId;

  forkJoin({
  reporting: this.userService.getUsersByCompanyRegion(u.companyId, u.regionId),
  hr: this.userService.getHrUsers(u.companyId, u.regionId)
}).subscribe((res: any) => {

  this.reportingToUsers = res.reporting;
  this.filteredHrUsers = res.hr.filter((x: any) =>
    x.designationName?.toLowerCase().includes('hr') ||
    x.designationName?.toLowerCase().includes('human resource')
  );
  

  // 🔥 CRITICAL FIX HERE
  setTimeout(() => {
    this.user.reportingTo = Number(u.reportingTo);
    this.user.reportingHr = Number(u.reportingHr);
  });
});

  // other dropdowns (already ready)
  this.filteredRegions = this.regions.filter(r =>
    Number(r.companyID) === Number(this.user.companyId)
  );

  this.filteredRoles = this.roles.filter(r =>
    Number(r.companyId) === Number(this.user.companyId) &&
    Number(r.regionId) === Number(this.user.regionId)
  );

  this.filterDepartments();
  this.filterDesignations();
}

  deleteUser(u: User): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will permanently delete the user.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        this.userService.deleteUser(u.userId!).subscribe({
          next: () => {
            this.showSuccess('User deleted successfully.');
            this.loadUsersForListing();
          },
          error: () => this.showError('Failed to delete user.')
        });
      }
    });
  }

  sendPasswordEmail(u: User): void {
    this.userService.sendWelcomeEmail(u).subscribe({
      next: () => this.showSuccess('Welcome email sent successfully!'),
      error: () => this.showError('Failed to send email.')
    });
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

  getCompanyName(id: any): string {
  return this.companies.find(c =>
    Number(c.companyId) === Number(id)
  )?.companyName || '-';
}

getRegionName(id: any): string {
  return this.regions.find(r =>
    Number(r.regionID) === Number(id)
  )?.regionName || '-';
}

  getRoleName(id: number): string {
    return this.roles.find(r => r.roleId === id)?.roleName || '-';
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
  // 🔹 Pagination
currentPage: number = 1;
pageSize: number = 5;
totalPages: number = 0;
paginatedUsers: User[] = [];
setPagination(): void {
  this.totalPages = Math.ceil(this.filteredUsers.length / this.pageSize) || 1;

  const start = (this.currentPage - 1) * this.pageSize;
  const end = start + this.pageSize;

  this.paginatedUsers = this.filteredUsers.slice(start, end);
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
