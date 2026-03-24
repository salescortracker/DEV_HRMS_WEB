import { Component } from '@angular/core';
import { AdminService } from '../../servies/admin.service';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { CompanyEventsService } from '../../../features/company-events/company-events.service';
@Component({
  selector: 'app-company-events',
  standalone: false,
  templateUrl: './company-events.component.html',
  styleUrl: './company-events.component.css'
})
export class CompanyEventsComponent {

companies:any[]=[];
regions:any[]=[];
departments:any[]=[];

eventsList:any[]=[];
event:any=this.resetEvent();

isEditMode=false;

searchText='';
startDate='';
endDate='';

userId!:number;
companyId!:number;
regionId!:number;

constructor(private cmpservice: AdminService, private adminService:CompanyEventsService,private spinner:NgxSpinnerService){}

ngOnInit(){

this.userId=Number(sessionStorage.getItem("UserId"));
this.companyId=Number(sessionStorage.getItem("CompanyId"));
this.regionId=Number(sessionStorage.getItem("RegionId"));

this.loadCompanies();
this.loadRegions();
this.loadDepartments();
this.getEvents();

}

loadCompanies(){
this.cmpservice.getCompanies(null,this.userId).subscribe((res:any)=>{
this.companies=res;
});
}

loadRegions(){
this.cmpservice.getRegions(null,this.userId).subscribe(res=>{
this.regions=res;
});
}

loadDepartments(){

this.cmpservice.getDepartments(this.userId).subscribe((res:any)=>{
this.departments=res.data.data.filter((d:any)=>d.isActive);
});

}

getDepartmentName(id:number){
debugger;
const d=this.departments.find(x=>x.departmentId==id);
return d.description;

}

resetEvent(){

return{

Id:0,
CompanyId:this.companyId,
RegionId:this.regionId,
DepartmentId:null,

EventTitle:'',
EventDescription:'',

EventDate:new Date(),
EventDateString:new Date().toISOString().split('T')[0],

StartTime:'',
EndTime:'',

MeetingLink:'',
EventLocation:'',
EventType:'',

IsMeeting:false
,userId:this.userId
}

}

resetForm(){

this.event=this.resetEvent();
this.isEditMode=false;

}

getEvents(){

this.spinner.show();

this.adminService.getAllEvents(this.userId).subscribe(res=>{

this.eventsList=res.map((e:any)=>({

Id:e.id,
CompanyId:e.companyId,
RegionId:e.regionId,
DepartmentId:e.departmentId,

EventTitle:e.eventTitle,
EventDescription:e.eventDescription,

EventDate:new Date(e.eventDate),
EventDateString:e.eventDate,

StartTime:e.startTime,
EndTime:e.endTime,

MeetingLink:e.meetingLink,
EventLocation:e.eventLocation,
EventType:e.eventType,

IsMeeting:e.isMeeting

}));

this.spinner.hide();

});

}

onSubmit(){

const payload={

id:this.event.Id??0,

companyId:Number(this.event.CompanyId),
regionId:Number(this.event.RegionId),
departmentId:Number(this.event.DepartmentId),
userId:this.userId,
eventTitle:this.event.EventTitle,
eventDescription:this.event.EventDescription,

eventDate:this.event.EventDateString,

startTime:this.event.StartTime,
endTime:this.event.EndTime,

meetingLink:this.event.MeetingLink,

eventLocation:this.event.EventLocation,
eventType:this.event.EventType,

isMeeting:this.event.IsMeeting,

createdBy:this.userId

};

this.spinner.show();

const request$=this.isEditMode
?this.adminService.updateEvent(payload)
:this.adminService.createEvent(payload);

request$.subscribe(()=>{

Swal.fire('Success','Event saved successfully','success');
this.getEvents();
this.resetForm();
this.spinner.hide();

});

}

editEvent(e:any){

this.isEditMode=true;

this.event={...e};

this.event.EventDateString=new Date(e.EventDate).toISOString().split('T')[0];

}

confirmDelete(e:any){

Swal.fire({
title:'Delete Event?',
icon:'warning',
showCancelButton:true
}).then(res=>{

if(res.isConfirmed){

this.adminService.deleteEvent(e.Id).subscribe(()=>{

Swal.fire('Deleted','Event removed','success');
this.getEvents();

});

}

});

}

filteredEvents(){

return this.eventsList.filter(e=>{

const matchText=e.EventTitle.toLowerCase().includes(this.searchText.toLowerCase());

const matchStart=this.startDate?new Date(e.EventDate)>=new Date(this.startDate):true;
const matchEnd=this.endDate?new Date(e.EventDate)<=new Date(this.endDate):true;

return matchText && matchStart && matchEnd;

});

}
}
