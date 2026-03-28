import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TourApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tours`;

  listTours() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getTour(id: string | number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createTour(data: any) {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateTour(id: string | number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteTour(id: string | number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
