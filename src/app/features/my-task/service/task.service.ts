import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private baseUrl = environment.apiUrl; // 🔹 Change this to your actual API URL
  constructor(private http: HttpClient) { }
  getTasks(userId: number) {
    return this.http.get(`${this.baseUrl}/Task/tasks?userId=${userId}`);
  }

  createTask(formData: FormData) {
    return this.http.post(`${this.baseUrl}/Task/CreateTask`, formData);
  }

  updateTask(formData: FormData) {
    return this.http.post(
      `${this.baseUrl}/Task/UpdateTask`,
      formData
    );
  }

  deleteTask(id: number) {
    return this.http.post(`${this.baseUrl}/Task/DeleteTask?id=${id}`, {});
  }
  getMyTasks(userId: number) {
    return this.http.get(`${this.baseUrl}/Task/mytasks?userId=${userId}`);
  }
  getFileBaseUrl(): string {
    return this.baseUrl.replace('/api', '');
  }
  getTaskReport(filters: any, companyId: number, regionId: number) {
    let params = `companyId=${companyId}&regionId=${regionId}`;

    if (filters.employeeId)
      params += `&employeeId=${filters.employeeId}`;

    if (filters.statusId)
      params += `&statusId=${filters.statusId}`;

    if (filters.priorityId)
      params += `&priorityId=${filters.priorityId}`;

    if (filters.fromDate)
      params += `&fromDate=${filters.fromDate}`;

    if (filters.toDate)
      params += `&toDate=${filters.toDate}`;

    return this.http.get(`${this.baseUrl}/Task/report?${params}`);
  }
}
