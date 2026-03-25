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
}
