import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DateInputComponent } from '../../core/components/date-input/date-input';
import { TranslationService } from '../../core/services/translation.service';
import { HotelApiService } from '../../core/services/api/hotel-api.service';
import { TourApiService } from '../../core/services/api/tour-api.service';
import { ExcursionApiService } from '../../core/services/api/excursion-api.service';
import { TransferApiService } from '../../core/services/api/transfer-api.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, DateInputComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {
  private translationService = inject(TranslationService);
  private hotelApi = inject(HotelApiService);
  private tourApi = inject(TourApiService);
  private excursionApi = inject(ExcursionApiService);
  private transferApi = inject(TransferApiService);
  private router = inject(Router);
  
  public t = this.translationService.translations;

  // Search State
  public activeCategory = signal<'hotels' | 'tours' | 'excursions' | 'transfers'>('hotels');
  public isLoading = signal<boolean>(false);
  public results = signal<any[]>([]);
  
  // Pagination State
  public currentPage = signal<number>(1);
  public totalItems = signal<number>(0);
  public limit = signal<number>(25);

  public totalPages = computed(() => Math.ceil(this.totalItems() / this.limit()));
  
  // Zero-safe startIndex and endIndex
  public startIndex = computed(() => this.totalItems() === 0 ? 0 : (this.currentPage() - 1) * this.limit() + 1);
  public endIndex = computed(() => Math.min(this.currentPage() * this.limit(), this.totalItems()));

  // Filter State
  public filters = {
    country: signal<string>(''),
    city: signal<string>(''),
    checkIn: signal<string>(''),
    checkOut: signal<string>(''),
    keyword: signal<string>('')
  };

  // Dropdown Data
  public countries = signal<string[]>(['Thailand']);
  public cities = signal<string[]>([]);

  constructor() {
    // Initial fetch
    this.refreshCities();
    this.onSearch();

    // Re-fetch when page or limit changes
    effect(() => {
      this.limit();
      this.currentPage();
      this.onSearch();
    });

    // Refresh cities and reset page when category changes
    effect(() => {
      this.activeCategory();
      this.currentPage.set(1);
      this.refreshCities();
    });
  }

  setCategory(cat: 'hotels' | 'tours' | 'excursions' | 'transfers') {
    this.activeCategory.set(cat);
  }

  onFilterSearch() {
    this.currentPage.set(1);
    this.onSearch();
  }

  onSearch() {
    this.isLoading.set(true);
    const cat = this.activeCategory();
    const filterObj = {
      country: this.filters.country(),
      city: this.filters.city(),
      search: this.filters.keyword(),
      limit: this.limit(),
      page: this.currentPage()
    };

    let obs: Observable<{ data: any[]; total: number }> | undefined;
    switch(cat) {
      case 'hotels': obs = this.hotelApi.listHotels(filterObj); break;
      case 'tours': obs = this.tourApi.listTours(filterObj); break;
      case 'excursions': obs = this.excursionApi.listExcursions(filterObj); break;
      case 'transfers': obs = this.transferApi.listTransfers(filterObj); break;
    }

    if (obs) {
      obs.subscribe({
        next: (res) => {
          this.results.set(res.data);
          this.totalItems.set(res.total);
          this.isLoading.set(false);
        },
        error: (err: any) => {
          console.error('Search error:', err);
          this.isLoading.set(false);
        }
      });
    } else {
      this.isLoading.set(false);
    }
  }

  refreshCities() {
    const cat = this.activeCategory();
    let obs: Observable<{ data: any[]; total: number }> | undefined;
    const metaFilter = { limit: 1000 };
    
    switch(cat) {
      case 'hotels': obs = this.hotelApi.listHotels(metaFilter); break;
      case 'tours': obs = this.tourApi.listTours(metaFilter); break;
      case 'excursions': obs = this.excursionApi.listExcursions(metaFilter); break;
      case 'transfers': obs = this.transferApi.listTransfers(metaFilter); break;
    }

    if (obs) {
      obs.subscribe(res => {
        const uniqueCities = Array.from(new Set(res.data.map((item: any) => item.city))).filter((c): c is string => !!c).sort();
        this.cities.set(uniqueCities);
      });
    }
  }

  // Pagination Helpers
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push(-1); // Ellipsis
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (current < total - 2) pages.push(-1); // Ellipsis
      pages.push(total);
    }
    return pages;
  }

  viewItem(item: any) {
    const cat = this.activeCategory();
    let route = '';
    
    switch(cat) {
      case 'hotels': route = '/control-panel/add-hotel'; break;
      case 'tours': route = '/control-panel/add-tour'; break;
      case 'excursions': route = '/control-panel/add-excursion'; break;
      case 'transfers': route = '/control-panel/add-transfer'; break;
    }

    if (route) {
      this.router.navigate([route, item.id], { queryParams: { mode: 'view' } });
    }
  }
}
