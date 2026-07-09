import { Component } from '@angular/core';
import { AdminService } from '../../admin/servies/admin.service';

@Component({
  selector: 'app-super-admin-roles-permissions',
  standalone: false,
  templateUrl: './super-admin-roles-permissions.component.html',
  styleUrl: './super-admin-roles-permissions.component.css'
})
export class SuperAdminRolesPermissionsComponent {
selectedAdminId: number | null = null;
selectedCompanyId: number | null = null;
selectedRegionId: number | null = null;
selectedRoleId: number | null = null;

admins: any[] = [];
companies: any[] = [];
regions: any[] = [];
roles: any[] = [];

collapsed = false;
submenus:any[]=[];

constructor(private adminService: AdminService) {}

ngOnInit() {
  this.loadAdmins();
}

toggleSidebar(){
  this.collapsed = !this.collapsed;
}

onMenuSelected(menu:any){
  this.submenus = menu;
}
loadAdmins() {
  this.adminService.getAdmins().subscribe((res: any) => {
    this.admins = res;
  });
}
onAdminChange(event: any) {
  this.selectedCompanyId = null;
  this.selectedRegionId = null;
  this.selectedRoleId = null;

  const adminId = event.target.value;

  this.adminService.getCompaniesByAdmin(adminId)
    .subscribe((res: any) => {
      this.companies = res;
      this.regions = [];
      this.roles = [];
    });
}
onCompanyChange(event: any) {
  this.selectedRegionId = null;
  this.selectedRoleId = null;

  const companyId = event.target.value;

  this.adminService.getRegionsByCompany(companyId)
    .subscribe((res: any) => {
      this.regions = res;
      this.roles = [];
    });
}
onRegionChange(event: any) {
  this.selectedRoleId = null;

  const regionId = event.target.value;

  this.adminService.getRolesByRegion(regionId)
    .subscribe((res: any) => {
      this.roles = res;
    });
}

}
