import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Needed for *ngIf
import { InterceptorService } from '../admin/shared/interceptor.service';
@Component({
  selector: 'app-spinner',
  standalone: false,
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css'
})
export class SpinnerComponent {
constructor(public spinner: InterceptorService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.spinner.loading$.subscribe(() => this.cdr.detectChanges());
  }
}
