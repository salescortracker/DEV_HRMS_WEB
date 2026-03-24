import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompanyNewsService {

  constructor(private http: HttpClient) { }

   GetNewsAll(userId: number) {
    return this.http.get(`${environment.companyNewsUrl}/GetNewsAll/${userId}`);
  }

  GetNewsAllById(id: number) {
    return this.http.get(`${environment.companyNewsUrl}/${id}`);
  }

  AddcompanyNews(data: any) {
    return this.http.post(`${environment.companyNewsUrl}/AddcompanyNews`, data);
  }

  addBulk(data: any[]) {
    return this.http.post(`${environment.companyNewsUrl}/Bulk`, data);
  }

  UpdatecompanyNews(id: number, data: any) {
    return this.http.post(`${environment.companyNewsUrl}/UpdatecompanyNews/${id}`, data);
  }

  DeletecompanyNews(id: number) {
    return this.http.post(`${environment.companyNewsUrl}/DeletecompanyNews/${id}`,{});
  }

  search(filter: any) {
    return this.http.post(`${environment.companyNewsUrl}/Search`, filter);
  }
}
