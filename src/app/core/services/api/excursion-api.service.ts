import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExcursionApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/excursions`;

  listExcursions() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getExcursion(id: string | number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createExcursion(data: any) {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateExcursion(id: string | number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteExcursion(id: string | number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
