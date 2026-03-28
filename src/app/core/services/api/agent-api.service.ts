import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AgentApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/agents`;

  listAgents() {
    return this.http.get<any[]>(this.apiUrl);
  }

  createAgent(data: any) {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateAgent(id: string | number, data: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteAgent(id: string | number) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
