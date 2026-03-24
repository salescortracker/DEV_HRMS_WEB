import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs'
import { environment } from '../../../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class MissedPunchService {
    private baseUrl = environment.apiUrl+'/attendance';
  constructor(private http: HttpClient) { }
  // 🔹 Create request
  createMissedPunchRequest(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/createmissedpunchrequest`, payload);
  }

  // 🔹 My Requests
  getMissedPunchRequest(companyId: number, regionId?: number): Observable<any[]> {
    let params = new HttpParams().set('companyId', companyId);
    if (regionId) params = params.set('regionId', regionId);
    return this.http.get<any[]>(`${this.baseUrl}/getmissedpunchrequest`, { params });
  }

  // 🔹 Manager Approval List
  getApprovalMissedPunchRequest(
    companyId: number,
    regionId: number | null,
    managerId: number
  ): Observable<any[]> {
    let params = new HttpParams()
      .set('companyId', companyId)
      .set('managerId', managerId);

    if (regionId) params = params.set('regionId', regionId);

    return this.http.get<any[]>(
      `${this.baseUrl}/getapprovalmissedpunchrequest`,
      { params }
    );
  }

  // 🔹 Single Approve / Reject
  updateMissedPunch(payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/updatemissedpunch`, payload);
  }

  // 🔥 Bulk Approve / Reject
  bulkApproveRejectPunch(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/bulkapproverejectpunch`, payload);
  }
}
