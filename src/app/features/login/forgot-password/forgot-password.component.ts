import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { AdminService } from '../../../admin/servies/admin.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
email: string = '';

  constructor(private service: AdminService, private router: Router) {}

  sendOtp() {

    if (!this.email) {
      Swal.fire('Error', 'Please enter email', 'error');
      return;
    }

    this.service.forgotPassword(this.email).subscribe({
      next: (res) => {
        if (res.success) {
          Swal.fire('Success', res.message, 'success');
          this.router.navigate(['/verify-otp'], {
            queryParams: { email: this.email }
          });
        } else {
          Swal.fire('Error', res.message, 'error');
        }
      },
      error: () => {
        Swal.fire('Error', 'Server error', 'error');
      }
    });
  }
}
