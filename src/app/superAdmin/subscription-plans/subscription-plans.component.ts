import { Component,OnInit } from '@angular/core';
import { AdminService } from '../../admin/servies/admin.service';
import Swal from 'sweetalert2';
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

deletePlan(id: number) {
  this.adminService.deletePlan(id).subscribe({
    next: () => {
      Swal.fire('Success', 'Plan deleted successfully.', 'success');
      this.loadPlans();
    },
    error: (err) => {
      Swal.fire(
        'Warning',
        err.error?.message || 'Unable to delete plan.',
        'warning'
      );
    }
  });
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
