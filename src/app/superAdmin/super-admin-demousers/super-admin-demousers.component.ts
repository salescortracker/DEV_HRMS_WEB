import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../admin/servies/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-super-admin-demousers',
  standalone: false,
  templateUrl: './super-admin-demousers.component.html',
  styleUrl: './super-admin-demousers.component.css'
})
export class SuperAdminDemousersComponent {
collapsed=false;
submenus:any[]=[];

toggleSidebar(){
this.collapsed=!this.collapsed;
}

onMenuSelected(menu:any){
this.submenus = menu;
}
demoUsers:any[]=[];
today:Date = new Date();

constructor(private adminService:AdminService){}

ngOnInit(){
this.loadDemoUsers();
}

paginatedUsers:any[] = [];

pageSize = 5;
currentPage = 1;
totalPages = 0;
totalPagesArray:number[] = [];
loadDemoUsers(){

this.adminService.getDemoUsers().subscribe((data:any)=>{

this.demoUsers = data;

this.totalPages = Math.ceil(this.demoUsers.length / this.pageSize);

this.totalPagesArray = Array(this.totalPages).fill(0).map((x,i)=>i+1);

this.updatePagination();

});

}

updatePagination(){

const start = (this.currentPage - 1) * this.pageSize;
const end = start + this.pageSize;

this.paginatedUsers = this.demoUsers.slice(start,end);

}

changePage(page:number){

if(page < 1 || page > this.totalPages){
return;
}

this.currentPage = page;

this.updatePagination();

}
showEditModal=false;
selectedUser:any={};
editUser(user:any){

this.selectedUser = {...user};
console.log(this.selectedUser);
this.selectedUser.userId = user.userId;
this.showEditModal = true;

}
closeModal(){

this.showEditModal=false;

}
updateExpiry(){

this.adminService.updateDemoExpiry({
UserID:this.selectedUser.userId,
DemoExpiryDate:this.selectedUser.demoExpiryDate
}).subscribe(res=>{

Swal.fire("Demo expiry updated successfully","Demo expiry updated successfully","success");

this.closeModal();

this.loadDemoUsers();

});

}
plans:any[]=[];
showPlanModal=false;
selectedPlanId:any;
selectedUserId:any;

openPlanModal(user:any){

this.selectedUserId = user.userId;

this.adminService.getPlans()
.subscribe((res:any)=>{
this.plans = res;
});

this.showPlanModal=true;

}

closePlanModal(){
this.showPlanModal=false;
}

applyPlan(){

const payload = {
UserId:this.selectedUserId,
PlanId:this.selectedPlanId
};

this.adminService.applyPlan(payload)
.subscribe(res=>{

Swal.fire(
"Success",
"Plan applied successfully",
"success"
);

this.closePlanModal();

});

}
menus:any[]=[];
showMenuModal=false;


selectedRoleId:any;
selectedMenus:number[]=[];

openMenuModal(plan:any){

this.selectedPlanId = plan.planId;
this.selectedMenus = [];

this.adminService.getAllMenus()
.subscribe((res:any)=>{
  this.menus = res;
});

this.showMenuModal = true;
}

closeMenuModal(){
this.showMenuModal=false;
}

onMenuChange(event:any, menuId:number){

if(event.target.checked){
  this.selectedMenus.push(menuId);
}else{
  this.selectedMenus = this.selectedMenus.filter(x=>x!==menuId);
}

}
mapMenu(menu:any){
  return {
    userId: this.selectedUserId,   // ✅ important
    roleId: this.selectedRoleId,
    menuId: menu.menuId,

    canView: menu.permissions?.view || false,
    canCreate: menu.permissions?.create || false,
    canEdit: menu.permissions?.edit || false,
    canDelete: menu.permissions?.delete || false,
    canApprove: menu.permissions?.approve || false
  };
}
saveMenus(){

if(!this.selectedRoleId){
  alert("Select role");
  return;
}

let payload:any[] = [];

this.menus.forEach(m => {

  // parent
  payload.push(this.mapMenu(m));

  // children
  if(m.children && m.children.length){
    m.children.forEach((c:any)=>{
      payload.push(this.mapMenu(c));
    });
  }

});

this.adminService.savePlanMenus(payload)
.subscribe(()=>{
  alert("Menus saved successfully");
  this.closeMenuModal();
});

}
toggleModule(menu:any, event:any){

const checked = event.target.checked;

// apply to parent
menu.permissions = {
  view: checked,
  create: checked,
  edit: checked,
  delete: checked,
  approve: checked
};

// apply to all children
menu.children.forEach((c:any)=>{
  c.permissions = { ...menu.permissions };
});

}
toggleSubModule(sub:any, event:any, parent:any){

const checked = event.target.checked;

sub.permissions = {
  view: checked,
  create: checked,
  edit: checked,
  delete: checked,
  approve: checked
};

// auto select parent if child selected
if(checked){
  parent.permissions.view = true;
}

}
onRoleChange(){

  if(!this.selectedRoleId){
    this.menus = [];
    return;
  }

  const type = this.selectedRoleId == 1 ? 'admin' : 'user';

  this.adminService.getMenusByType(type)
  .subscribe((res:any)=>{

    this.menus = this.buildMenuTree(res);

  });

}
buildMenuTree(data:any[]){

  const parents = data.filter(x => !x.parentMenuId);

  return parents.map(p => ({
    ...p,
    expanded:false,
    permissions:this.getDefaultPermissions(),
    children: data
      .filter(c => c.parentMenuId === p.menuId)
      .map(c => ({
        ...c,
        permissions:this.getDefaultPermissions()
      }))
  }));

}
getDefaultPermissions(){
  return {
    view:false,
    create:false,
    edit:false,
    delete:false,
    approve:false
  };
}
}
