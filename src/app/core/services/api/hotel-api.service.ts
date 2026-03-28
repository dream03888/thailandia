import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HotelApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/hotels`;

  listHotels(city?: string) {
    let params = new HttpParams();
    if (city) {
      params = params.set('city', city);
    }
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  getHotel(id: string | number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createHotel(data: any) {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateHotel(id: string | number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteHotel(id: string | number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
