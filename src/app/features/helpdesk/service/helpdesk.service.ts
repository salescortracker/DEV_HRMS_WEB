import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class HelpdeskService {

  private baseUrl = environment.apiUrl; // 🔹 Change this to your actual API URL
  
    constructor(private http: HttpClient) {}
    
    getPriorities(companyId: number, regionId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.baseUrl}/Helpdesk/GetActivePriorities/${companyId}/${regionId}`
  );
}

 getCategory(companyId: number, regionId: number): Observable<any[]> {
  return this.http.get<any[]>(
    `${this.baseUrl}/Helpdesk/GetActiveCategory/${companyId}/${regionId}`
  );
}
getUserProfile(userId: number): Observable<any> {
  return this.http.get<any>(
    `${this.baseUrl}/Helpdesk/GetUserProfile/${userId}`
  );
}
 submitTicket(formData: FormData) {
    return this.http.post(`${this.baseUrl}/Helpdesk/SubmitTicket`, formData);
  }

  getMyTickets(userId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/Helpdesk/GetMyTickets/${userId}`);
  }

  /////approve
  getManagerTickets(managerId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Helpdesk/GetManagerTickets/${managerId}`
  );
}

updateTicketStatus(payload: any) {
  return this.http.post(
    `${this.baseUrl}/Helpdesk/UpdateTicketStatus`,
    payload
  );
}
getEmployeesByManager(managerId: number) {
  return this.http.get<any[]>(
    `${this.baseUrl}/Helpdesk/GetEmployeesByManager/${managerId}`
  );
}
}
