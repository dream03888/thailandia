import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TransferApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/transfers`;

  listTransfers() {
    return this.http.get<any[]>(this.apiUrl);
  }

  getTransfer(id: string | number) {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createTransfer(data: any) {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateTransfer(id: string | number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteTransfer(id: string | number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
