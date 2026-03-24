import { Component,Input } from '@angular/core';
@Component({
  selector: 'app-super-admin-submenu',
  standalone: false,
  templateUrl: './super-admin-submenu.component.html',
  styleUrl: './super-admin-submenu.component.css'
})
export class SuperAdminSubmenuComponent {
@Input() submenus:any[]=[];
}
