import { Component,OnInit } from '@angular/core';
import { AdminService } from '../../admin/servies/admin.service';
@Component({
  selector: 'app-subscription-plans',
  standalone: false,
  templateUrl: './subscription-plans.component.html',
  styleUrl: './subscription-plans.component.css'
})
export class SubscriptionPlansComponent {

plans:any[]=[];
plan:any={};

showModal=false;
editMode=false;

constructor(private adminService:AdminService){}

ngOnInit(){
this.loadPlans();
}

loadPlans(){
this.adminService.getPlans()
.subscribe((res:any)=>{
this.plans=res;
});
}

openModal(){
this.plan={};
this.editMode=false;
this.showModal=true;
}

editPlan(p:any){
this.plan={...p};
this.editMode=true;
this.showModal=true;
}

savePlan(){

if(this.editMode){

this.adminService.updatePlan(this.plan.planId,this.plan)
.subscribe(()=>{
this.loadPlans();
this.showModal=false;
});

}else{

this.adminService.createPlan(this.plan)
.subscribe(()=>{
this.loadPlans();
this.showModal=false;
});

}

}

deletePlan(id:any){

if(confirm("Delete plan?")){

this.adminService.deletePlan(id)
.subscribe(()=>{
this.loadPlans();
});

}

}
collapsed=false;
submenus:any[]=[];

toggleSidebar(){
this.collapsed=!this.collapsed;
}

onMenuSelected(menu:any){
this.submenus = menu;
}
}
