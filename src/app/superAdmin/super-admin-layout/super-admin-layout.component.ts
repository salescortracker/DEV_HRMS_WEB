import { Component } from '@angular/core';

@Component({
  selector: 'app-super-admin-layout',
  standalone: false,
  templateUrl: './super-admin-layout.component.html',
  styleUrl: './super-admin-layout.component.css'
})
export class SuperAdminLayoutComponent {
collapsed=false;

submenus:any[]=[];

toggleSidebar(){
this.collapsed=!this.collapsed;
}

onMenuSelected(menu:any){
this.submenus = menu;
}
}
