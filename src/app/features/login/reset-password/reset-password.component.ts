import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminService } from '../../../admin/servies/admin.service';
@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
showPassword: boolean = false;

email: string = '';
  newPassword: string = '';

  constructor(
    private route: ActivatedRoute,
    private service: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.email = this.route.snapshot.queryParams['email'];
  }

  togglePassword() {
  this.showPassword = !this.showPassword;
}

  reset() {

  if (!this.newPassword) {
    Swal.fire('Error', 'Enter new password', 'error');
    return;
  }

  this.service.resetPassword(this.email, this.newPassword).subscribe({
    next: (res) => {
      if (res.success) {

        Swal.fire({
          title: 'Success',
          text: 'Password reset successful',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then((result) => {
          if (result.isConfirmed) {
            this.router.navigate(['/']);
          }
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
