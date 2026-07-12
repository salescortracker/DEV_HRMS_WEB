import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EarlyLogoutService {
  private baseUrl = environment.apiUrl + '/attendance';

  constructor(private http: HttpClient) {}

  createEarlyLogoutRequest(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/createearlylogoutrequest`, payload);
  }

  getEarlyLogoutRequest(companyId: number, regionId?: number, userId?: number): Observable<any[]> {
    let params = new HttpParams()
      .set('companyId', companyId)
      .set('userId', userId!);

    if (regionId) {
      params = params.set('regionId', regionId);
    }

    return this.http.get<any[]>(`${this.baseUrl}/getearlylogoutrequest`, { params });
  }

  getApprovalEarlyLogoutRequest(
    companyId: number,
    regionId: number | null,
    managerId: number
  ): Observable<any[]> {
    let params = new HttpParams()
      .set('companyId', companyId)
      .set('managerId', managerId);

    if (regionId) {
      params = params.set('regionId', regionId);
    }

    return this.http.get<any[]>(`${this.baseUrl}/getapprovalearlylogoutrequest`, { params });
  }

  updateEarlyLogout(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/updateearlylogout`, payload);
  }

  bulkApproveRejectEarlyLogout(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/bulkapproverejectearlylogout`, payload);
  }

  createLateArrivalRequest(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/CreateLateArrivalRequest`,
      data
    );
  }

  getLateArrivalRequest(
    companyId: number,
    regionId: number,
    userId: number
  ): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/getLateArrivalRequest?companyId=${companyId}&regionId=${regionId}&userId=${userId}`
    );
  }

  getApprovalLateArrivalRequest(
    companyId: number,
    regionId: number,
    userId: number
  ): Observable<any> {

    return this.http.get(
      `${this.baseUrl}/getApprovalLateArrivalRequest?companyId=${companyId}&regionId=${regionId}&userId=${userId}`
    );
  }

  updateLateArrival(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/updateLateArrival`,
      data
    );
  }

  bulkApproveRejectLateArrival(data: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/bulkapproverejectlatearrival`,
      data
    );
  }
}
