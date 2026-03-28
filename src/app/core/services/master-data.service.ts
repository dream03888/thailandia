import { Injectable, inject, signal, computed } from '@angular/core';
import { HotelApiService } from './api/hotel-api.service';
import { TourApiService } from './api/tour-api.service';
import { ExcursionApiService } from './api/excursion-api.service';
import { TransferApiService } from './api/transfer-api.service';
import { AgentApiService } from './api/agent-api.service';
import { forkJoin } from 'rxjs';

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
    const all = [
      ...this.hotels().map(h => h.city),
      ...this.tours().map(t => t.city),
      ...this.excursions().map(e => e.city),
      ...this.transfers().map(t => t.city),
    ];
    return Array.from(new Set(all.filter(c => !!c))).sort();
  });

  refresh() {
    forkJoin({
      hotels: this.hotelApi.listHotels(),
      tours: this.tourApi.listTours(),
      excursions: this.excursionApi.listExcursions(),
      transfers: this.transferApi.listTransfers(),
      agents: this.agentApi.listAgents()
    }).subscribe((data: any) => {
      this.hotels.set(data.hotels);
      this.tours.set(data.tours);
      this.excursions.set(data.excursions);
      this.transfers.set(data.transfers);
      this.agents.set(data.agents);
    });
  }
}
