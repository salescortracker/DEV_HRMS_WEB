import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EarlyLogoutService } from '../early-logout-request/service/early-logout.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-early-departures',
  standalone: false,
  templateUrl: './early-departures.component.html',
  styleUrl: './early-departures.component.css'
})
export class EarlyDeparturesComponent implements OnInit {
  selectedTab = '';

  earlyDepartureForm!: FormGroup;


  isEditMode = false;
  editId:number|null = null;


  canViewPersonal = false;
  canViewManager = false;
  canViewHR = false;


  canCreateMyRequest = false;
  canEditMyRequest = false;



  myRequests:any[] = [];

  pendingRequests:any[] = [];

  approvedRequests:any[] = [];

  rejectedRequests:any[] = [];

  hrRequests:any[] = [];



  pagedMyRequests:any[]=[];

  pagedPendingRequests:any[]=[];

  pagedApprovedRequests:any[]=[];

  pagedRejectedRequests:any[]=[];




  myCurrentPage = 1;
  myPageSize = 5;
  myTotalPages = 1;



  pendingCurrentPage = 1;
  approvedCurrentPage = 1;
  rejectedCurrentPage = 1;


  managerPageSize = 5;


  pendingTotalPages = 1;
  approvedTotalPages = 1;
  rejectedTotalPages = 1;



  currentPage = 1;
  pageSize = 5;

  totalPages = 1;

  pageSizeOptions=[5,10,25,50];



  companyId =
  Number(sessionStorage.getItem('CompanyId'));

  regionId =
  Number(sessionStorage.getItem('RegionId'));

  userId =
  Number(sessionStorage.getItem('UserId'));

  constructor(private fb:FormBuilder, private cdr:ChangeDetectorRef, private earlyDepartureService:EarlyLogoutService) { }
  ngOnInit():void{


    this.initializeForm();


    this.loadPermissions();



    if(this.canViewPersonal)
      this.selectedTab='tab1';

    else if(this.canViewManager)
      this.selectedTab='tab2';

    else if(this.canViewHR)
      this.selectedTab='tab3';



    this.loadMyRequests();

    this.loadPendingRequests();


  }





  initializeForm(){

    this.earlyDepartureForm =
    this.fb.group({


      requestDate:[
        null,
        Validators.required
      ],


      requestedEarlyLogoutTime:[
        null,
        Validators.required
      ],


      reason:[
        '',
        Validators.required
      ],


      hrEmail:[
        ''
      ]

    });

  }

changeManagerPageSize(size:any): void {

  this.managerPageSize = Number(size);

  this.pendingCurrentPage = 1;
  this.approvedCurrentPage = 1;
  this.rejectedCurrentPage = 1;

  this.updateManagerPagination();

}

submitEarlyDeparture(){
if(this.earlyDepartureForm.invalid){

  this.earlyDepartureForm.markAllAsTouched();

  return;

}

if(!this.isEditMode){

const payload = {
  companyID: this.companyId,
  regionID: this.regionId,
  userId: this.userId,
  requestDate: this.earlyDepartureForm.value.requestDate,
  requestedDepartureTime: this.earlyDepartureForm.value.requestedEarlyLogoutTime,
  reason: this.earlyDepartureForm.value.reason,
  hrEmail: this.earlyDepartureForm.value.hrEmail
};

this.earlyDepartureService
.createEarlyDepartureRequest(payload)
.subscribe({
next:(res:any)=>{

 Swal.fire(
  'Success',
  res.message,
  'success'
 );
 this.resetForm();
 this.loadMyRequests();
 this.loadPendingRequests();
},


error:(err:any)=>{

 Swal.fire(
 'Error',
 err.error?.message || 'Something went wrong',
 'error'
 );

}
});

}

else{
const payload = {
  earlyDepartureRequestId: this.editId,
  companyID: this.companyId,
  regionID: this.regionId,
  requestDate: this.earlyDepartureForm.value.requestDate,
  requestedDepartureTime: this.earlyDepartureForm.value.requestedEarlyLogoutTime,
  reason: this.earlyDepartureForm.value.reason,
  hrEmail: this.earlyDepartureForm.value.hrEmail
};
this.earlyDepartureService
.updateEarlyDeparture(payload)
.subscribe({

next:(res:any)=>{

 Swal.fire(
 'Success',
 res.message,
 'success'
 );

 this.resetForm();
 this.loadMyRequests();
},



error:(err:any)=>{
 Swal.fire(
 'Error',
 err.error?.message || 'Update Failed',
 'error'
 );

}
});
}
}

editEarlyDeparture(item:any){


this.isEditMode=true;


this.editId=item.earlyDepartureRequestId;



this.earlyDepartureForm.patchValue({


requestDate:item.requestDate,


requestedEarlyLogoutTime:
item.requestedEarlyLogoutTime,


reason:item.reason,


hrEmail:item.hrEmail


});


}






resetForm(){

this.earlyDepartureForm.reset();

this.isEditMode=false;

this.editId=null;

}







loadPermissions(){


const menus =
JSON.parse(
sessionStorage.getItem('Menus') || '[]'
);



const roleName =
(sessionStorage.getItem('roleName') || '')
.toLowerCase();



const designationName =
(sessionStorage.getItem('DesignationName') || '')
.toLowerCase();



const personal =
menus.find((x:any)=>
x.menuName?.toLowerCase()==='my request'
);



const manager =
menus.find((x:any)=>
x.menuName?.toLowerCase()==='manager approval'
);



const hr =
menus.find((x:any)=>
x.menuName?.toLowerCase()==='hr and manager'
);




this.canViewPersonal =
personal?.canView ?? false;


this.canCreateMyRequest =
personal?.canAdd ?? false;


this.canEditMyRequest =
personal?.canEdit ?? false;



this.canViewManager =
manager?.canView ?? false;



this.canViewHR =
hr?.canView ?? false;



}

loadMyRequests() {

  this.earlyDepartureService
    .getEarlyDepartureRequest(
      this.companyId,
      this.regionId,
      this.userId
    )
    .subscribe({

      next: (res: any) => {

        console.log('My Requests API', res);

        this.myRequests = res || [];

        console.log('myRequests', this.myRequests);

        this.myCurrentPage = 1;

        this.updateMyPagination();

      },

      error: (err: any) => {

        console.log(err);

      }

    });

}

loadPendingRequests(){

this.earlyDepartureService
.getApprovalEarlyDepartureRequest(
this.companyId,
this.regionId,
this.userId
)
.subscribe({



next:(res:any[])=>{


this.pendingRequests =
res.filter(x=>x.status==='Pending');


this.approvedRequests =
res.filter(x=>x.status==='Approved');


this.rejectedRequests =
res.filter(x=>x.status==='Rejected');



this.hrRequests=res;



this.updateManagerPagination();


},



error:(err:any)=>{


console.log(err);


}



});


}








get combinedRequests(){


return this.hrRequests.length>0
?
this.hrRequests
:
[
...this.pendingRequests,
...this.approvedRequests,
...this.rejectedRequests
];


}







updateMyPagination(){


this.myTotalPages =
Math.max(
1,
Math.ceil(
this.myRequests.length /
this.myPageSize
)
);



let start =
(this.myCurrentPage-1)
*
this.myPageSize;



this.pagedMyRequests =
this.myRequests.slice(
start,
start+this.myPageSize
);



}







updateManagerPagination(){



this.pendingTotalPages =
Math.max(
1,
Math.ceil(
this.pendingRequests.length /
this.managerPageSize
)
);



this.approvedTotalPages =
Math.max(
1,
Math.ceil(
this.approvedRequests.length /
this.managerPageSize
)
);



this.rejectedTotalPages =
Math.max(
1,
Math.ceil(
this.rejectedRequests.length /
this.managerPageSize
)
);




this.pagedPendingRequests =
this.pendingRequests.slice(
(this.pendingCurrentPage-1)*this.managerPageSize,
this.pendingCurrentPage*this.managerPageSize
);



this.pagedApprovedRequests =
this.approvedRequests.slice(
(this.approvedCurrentPage-1)*this.managerPageSize,
this.approvedCurrentPage*this.managerPageSize
);



this.pagedRejectedRequests =
this.rejectedRequests.slice(
(this.rejectedCurrentPage-1)*this.managerPageSize,
this.rejectedCurrentPage*this.managerPageSize
);



}








selectAll(event:any){


const checked =
event.target.checked;


this.pendingRequests.forEach(x=>{
x.selected=checked;
});


}







bulkApproveReject(status:'Approved'|'Rejected'){


const selected =
this.pendingRequests.filter(
x=>x.selected
);



if(selected.length===0){


Swal.fire(
'Warning',
'Please select at least one request.',
'warning'
);


return;

}



const payload={


earlyDepartureRequestIds:
selected.map(
x=>x.earlyDepartureRequestId
),


managerID:this.userId,


status:status,


managerRemarks:
selected[0].managerRemarks || ''


};





this.earlyDepartureService
.bulkApproveRejectEarlyDeparture(payload)
.subscribe({


next:(res:any)=>{


Swal.fire(
'Success',
res.message,
'success'
);



this.loadPendingRequests();


},



error:(err:any)=>{


Swal.fire(
'Error',
err.error?.message || 'Operation Failed',
'error'
);


}


});


}








changeMyPage(page:number){

if(page<1 || page>this.myTotalPages)
return;


this.myCurrentPage=page;

this.updateMyPagination();

}





changePendingPage(page:number){

if(page<1 || page>this.pendingTotalPages)
return;


this.pendingCurrentPage=page;

this.updateManagerPagination();

}





changeApprovedPage(page:number){

if(page<1 || page>this.approvedTotalPages)
return;


this.approvedCurrentPage=page;

this.updateManagerPagination();

}





changeRejectedPage(page:number){

if(page<1 || page>this.rejectedTotalPages)
return;


this.rejectedCurrentPage=page;

this.updateManagerPagination();

}

}
