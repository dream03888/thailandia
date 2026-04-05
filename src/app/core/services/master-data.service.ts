import { Injectable, inject, signal, computed } from '@angular/core';
import { HotelApiService } from './api/hotel-api.service';
import { TourApiService } from './api/tour-api.service';
import { ExcursionApiService } from './api/excursion-api.service';
import { TransferApiService } from './api/transfer-api.service';
import { AgentApiService } from './api/agent-api.service';
import { forkJoin, tap, catchError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MasterDataService {
  private hotelApi = inject(HotelApiService);
  private tourApi = inject(TourApiService);
  private excursionApi = inject(ExcursionApiService);
  private transferApi = inject(TransferApiService);
  private agentApi = inject(AgentApiService);

  hotels = signal<any[]>([]);
  tours = signal<any[]>([]);
  excursions = signal<any[]>([]);
  transfers = signal<any[]>([]);
  agents = signal<any[]>([]);

  cities = computed(() => {
    try {
      const all = [
        ...(this.hotels() || []).map(h => h.city),
        ...(this.tours() || []).map(t => t.city),
        ...(this.excursions() || []).map(e => e.city),
        ...(this.transfers() || []).map(t => t.city),
      ];
      return Array.from(new Set(all.filter(c => !!c))).sort();
    } catch (e) {
      console.error('MasterDataService cities error:', e);
      return [];
    }
  });

  refresh() {
    const filters = { limit: 1000 };
    return forkJoin({
      hotels: this.hotelApi.listHotels(filters).pipe(catchError(() => of([]))),
      tours: this.tourApi.listTours(filters).pipe(catchError(() => of([]))),
      excursions: this.excursionApi.listExcursions(filters).pipe(catchError(() => of([]))),
      transfers: this.transferApi.listTransfers(filters).pipe(catchError(() => of([]))),
      agents: this.agentApi.listAgents().pipe(catchError(() => of([])))
    }).pipe(
      tap((data: any) => {
        const getData = (val: any) => {
          if (Array.isArray(val)) return val;
          if (val && Array.isArray(val.data)) return val.data;
          return [];
        };
        this.hotels.set(getData(data.hotels));
        this.tours.set(getData(data.tours));
        this.excursions.set(getData(data.excursions));
        this.transfers.set(getData(data.transfers));
        this.agents.set(getData(data.agents));
      })
    );
  }

  clear() {
    this.hotels.set([]);
    this.tours.set([]);
    this.excursions.set([]);
    this.transfers.set([]);
    this.agents.set([]);
  }
}
