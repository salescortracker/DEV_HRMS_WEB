// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { AdminService } from '../../../admin/servies/admin.service';
// import Swal from 'sweetalert2';

// @Component({
//   selector: 'app-login',
//   standalone: false,
//   templateUrl: './login.component.html',
//   styleUrl: './login.component.css'
// })
// export class LoginComponent implements OnInit {

//   username: string = '';
//   password: string = '';
//   errorMessage: string = '';
//   loading: boolean = false;

//   constructor(private router: Router, private loginService: AdminService) {}

//   // ✅ CLEAR OLD SESSION (VERY IMPORTANT 🔥)
//   ngOnInit() {
//     sessionStorage.clear();
//   }

//   login() {
//     this.errorMessage = '';

//     if (!this.username || !this.password) {
//       this.errorMessage = 'Please enter username and password';
//       return;
//     }

//     this.loading = true;

//     this.loginService.login(this.username, this.password).subscribe({
//       next: (response) => {
//         this.loading = false;

//         if (response && response.message) {

//           if (response.user.error) {
//             Swal.fire('Login Failed', response.user.error, 'error');
//             return;
//           }

//           // ✅ Store session data
//           sessionStorage.setItem('UserId', response.user.userId.toString()); // 🔥 KEY FIX
//           sessionStorage.setItem('CompanyId', response.user.companyId);
//           sessionStorage.setItem('RegionId', response.user.regionId.toString());
//           sessionStorage.setItem('roleId', response.user.roleId.toString());
//           sessionStorage.setItem('roleName', response.user.roleName);
//           sessionStorage.setItem('currentUser', JSON.stringify(response.user));

//           sessionStorage.setItem('Name', response.user.fullName);
//           sessionStorage.setItem('EmployeeCode', response.user.employeeCode);
//           sessionStorage.setItem('Email', response.user.personalEmail);

//           sessionStorage.setItem('DepartmentName', response.user.departmentName ?? '');
//           sessionStorage.setItem('ReportingManagerName', response.user.reportingManagerName ?? '');
//           sessionStorage.setItem('Designation', response.user.designation ?? '');

//           sessionStorage.setItem('RegionName', response.user.regionName);
//           sessionStorage.setItem('CompanyName', response.user.companyName);

//           sessionStorage.setItem('DepartmentProject', response.user.departmentProject ?? '');
//           sessionStorage.setItem('paswordChanged', response.user.paswordChanged ?? '');

//           sessionStorage.setItem('repotingTo', response.user.reportingTo);
//           sessionStorage.setItem('DepartmentId', response.user.departmentId?.toString() ?? '');
//           sessionStorage.setItem('reportingManagerId', response.user.reportingManagerId?.toString() ?? '');
//           sessionStorage.setItem('userCompanyId', response.user.userCompanyId?.toString() ?? '');

//           Swal.fire('Login Successful', response.message, 'success');

//           // 🔐 Force password change
//           if (response.user.paswordChanged == null) {
//             Swal.fire('Change Password', 'You must change your password before proceeding.', 'info');
//             this.router.navigate(['/change-password'], {
//               queryParams: { userId: response.user.userId }
//             });
//             return;
//           }

//           // ✅ Role-based navigation
//           let route = '/dashboard';

//           if (response.user.roleId === 0) {
//             route = '/superadmin-dashboard';
//           }
//           else if (response.user.roleName === 'Admin') {
//             route = '/admin/dashboard';
//           }
//           else {
//             route = '/dashboard';
//           }

//           this.router.navigate([route]);

//         } else {
//           this.errorMessage = 'Invalid username or password';
//         }
//       },

//       error: (error) => {
//         this.loading = false;
//         console.error('Login failed:', error);
//         this.errorMessage = 'Server error. Please try again.';
//       }
//     });
//   }
// }







import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../../admin/servies/admin.service';
import Swal from 'sweetalert2';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  username: string = '';
  password: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  private isBrowser: boolean;

  constructor(
    private router: Router,
    private loginService: AdminService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  // ✅ SAFE CLEAR (NO SSR ERROR)
  ngOnInit() {
    if (this.isBrowser) {
      sessionStorage.clear();
    }
  }

  login() {
    this.errorMessage = '';

    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter username and password';
      return;
    }

    this.loading = true;

    this.loginService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.loading = false;

        if (response && response.message) {

          if (response.user.error) {
            Swal.fire('Login Failed', response.user.error, 'error');
            return;
          }

          // ✅ STORE ONLY IN BROWSER
          if (this.isBrowser) {
            sessionStorage.setItem('UserId', response.user.userId.toString());
            sessionStorage.setItem('CompanyId', response.user.companyId);
            sessionStorage.setItem('RegionId', response.user.regionId.toString());
            sessionStorage.setItem('roleId', response.user.roleId.toString());
            sessionStorage.setItem('roleName', response.user.roleName);
            sessionStorage.setItem('currentUser', JSON.stringify(response.user));
          }

          Swal.fire('Login Successful', response.message, 'success');

          let route = '/dashboard';

          if (response.user.roleName === 'Admin') {
            route = '/admin/dashboard';
          }

          this.router.navigate([route]);

        } else {
          this.errorMessage = 'Invalid username or password';
        }
      },

      error: (error) => {
        this.loading = false;
        console.error('Login failed:', error);
        this.errorMessage = 'Server error. Please try again.';
      }
    });
  }
}