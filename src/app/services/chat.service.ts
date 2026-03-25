import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'http://127.0.0.1:8000/chat';

  constructor(private http: HttpClient) {}

  sendMessage(message: string, empId: number = 1): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      message: message,
      emp_id: empId   // ✅ added (matches backend)
    }).pipe(
      catchError((error) => {
        console.error('Chat API Error:', error);
        return throwError(() => error);
      })
    );
  }
}