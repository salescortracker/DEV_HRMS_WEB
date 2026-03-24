import { Component,EventEmitter,Output } from '@angular/core';
@Component({
  selector: 'app-super-admin-topbar',
  standalone: false,
  templateUrl: './super-admin-topbar.component.html',
  styleUrl: './super-admin-topbar.component.css'
})
export class SuperAdminTopbarComponent {
@Output() toggleSidebar = new EventEmitter();

userName="Admin";
}
