import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from '../../servies/admin.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-welcomedemo',
  standalone: false,
  templateUrl: './welcomedemo.component.html',
  styleUrl: './welcomedemo.component.css'
})
export class WelcomedemoComponent {
 demoForm!: FormGroup;

  constructor(private fb: FormBuilder,private demoService: AdminService) {}

  ngOnInit(): void {
    this.demoForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      company: [''],
      module: ['']
    });
  }

  submit() {
  if (this.demoForm.invalid) {
    this.demoForm.markAllAsTouched();
    return;
  }

  this.demoService.submitDemoRequest(this.demoForm.value)
    .subscribe({
      next: () => {
        Swal.fire('Success!', 'Demo request submitted successfully! We have received your request and will send an email shortly.', 'success');
        this.demoForm.reset();
      },
      error: () => {
        Swal.fire('Error!', 'Failed to submit demo request', 'error');
      }
    });
}
}
