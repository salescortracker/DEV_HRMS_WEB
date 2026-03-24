import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class TimesheetService {
private baseUrl = environment.apiUrl; // 🔹 Change this to your actual API URL

    constructor(private http: HttpClient) {}

getLoggedInUser(userId: number): Observable<any> {
  return this.http.get<any>(
    `${environment.apiUrl}/Timesheet/GetLoggedInUser/${userId}`
  );
}
gettimesheetlisting(userId: number): Observable<any> {
  return this.http.get<any>(`${environment.apiUrl}/Timesheet/GetMyTimesheets/${userId}`);
}
submittimesheet(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Timesheet/SaveTimesheet`, formData);
  }
  sendSelectedTimesheets(ids: number[]) {
  return this.http.post(`${environment.apiUrl}/Timesheet/SendSelectedTimesheets`, ids);
}
// ✅ MANAGER LIST
  getManagerTimesheets(managerId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/Timesheet/GetManagerTimesheets/${managerId}`);
  }

  // ✅ VIEW FULL TIMESHEET DETAILS
  getTimesheetDetail(timesheetId: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/Timesheet/GetTimesheetDetail/${timesheetId}`);
  }

  // ✅ APPROVE / REJECT
  approveTimesheets(ids: number[], comments: string) {
    return this.http.post(`${environment.apiUrl}/Timesheet/ApproveTimesheets`, { ids, comments });
  }

  rejectTimesheets(ids: number[], comments: string) {
    return this.http.post(`${environment.apiUrl}/Timesheet/RejectTimesheets`, { ids, comments });
  }
}
