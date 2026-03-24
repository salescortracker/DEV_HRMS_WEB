import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface CompanyEvent {

  Id?: number;

  CompanyId?: number;
  RegionId?: number;
  DepartmentId?: number;

  EventTitle: string;
  EventDescription: string;

  EventDate: Date;
  EventDateString?: string;

  StartTime: string;
  EndTime: string;

  MeetingLink?: string;

  EventLocation?: string;
  EventType?: string;

  IsMeeting: boolean;

}
@Injectable({
  providedIn: 'root'
})
export class CompanyEventsService {
apiUrl = environment.apiUrl+"/CompanyEvent/";

constructor(private http: HttpClient) { }

getAllEvents(userId:number): Observable<any>{
return this.http.get(this.apiUrl + "GetAllEvents?userId=" + userId);
}
getAllDepartmentEvents(departmentId:number): Observable<any>{
return this.http.get(this.apiUrl + "GetDepartmentEvents?departmentId=" + departmentId);
}
getMyCalendar(userId:number){
 return this.http.get<any>(this.apiUrl +"GetMyCalendar?userId=" + userId)
}
getDepartmentEvents(companyId:number,regionId:number,departmentId:number): Observable<any>{

return this.http.get(
this.apiUrl + "GetDepartmentEvents?companyId=" + companyId +
"&regionId=" + regionId +
"&departmentId=" + departmentId
);

}

createEvent(data:any){
return this.http.post(this.apiUrl + "CreateEvent",data);
}

updateEvent(data:any){
return this.http.post(this.apiUrl + "UpdateEvent",data);
}

deleteEvent(id:number){
return this.http.post(this.apiUrl + "DeleteEvent?id=" + id,{});
}

}
