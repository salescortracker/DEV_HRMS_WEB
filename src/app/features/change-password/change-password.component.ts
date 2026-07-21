import { Component} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../admin/servies/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-password',
  standalone: false,
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent {
userId!: number;

  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService
  ) {}

 
  changePassword() {
    console.log('SUBMIT CALLED'); // ✅ DEBUG CHECK

    this.errorMessage = '';

    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'All fields are required';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }
    const passwordRegex =
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,13}$/;

if (!passwordRegex.test(this.newPassword)) {
  Swal.fire({
    icon: 'warning',
    title: 'Invalid Password',
    html: `
      Password must contain:<br><br>
      ✔ 8 to 13 characters<br>
      ✔ At least one uppercase letter (A-Z)<br>
      ✔ At least one lowercase letter (a-z)<br>
      ✔ At least one number (0-9)<br>
      ✔ At least one special character (@$!%*?&)<br>
      ✔ No spaces
    `
  });
  return;
}

    this.loading = true;

    this.adminService.changePassword({
      UserID: sessionStorage.getItem('UserId') ? +sessionStorage.getItem('UserId')! : 0,
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        Swal.fire('Success', 'Password changed successfully', 'success');
        this.router.navigate(['/']);
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Something went wrong';
      }
    });
  }
}
