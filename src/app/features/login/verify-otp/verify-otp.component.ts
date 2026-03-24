import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminService } from '../../../admin/servies/admin.service';
@Component({
  selector: 'app-verify-otp',
  standalone: false,
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.css'
})
export class VerifyOtpComponent {
email: string = '';
  otp: string = '';

  constructor(
    private route: ActivatedRoute,
    private service: AdminService,
    private router: Router
  ) {}

  ngOnInit() {
    this.email = this.route.snapshot.queryParams['email'];
  }

  verify() {

    if (!this.otp) {
      Swal.fire('Error', 'Enter OTP', 'error');
      return;
    }

    this.service.verifyOtp(this.email, this.otp).subscribe({
      next: (res) => {
        if (res.success) {
          Swal.fire('Success', 'OTP Verified', 'success');
          this.router.navigate(['/reset-password'], {
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
