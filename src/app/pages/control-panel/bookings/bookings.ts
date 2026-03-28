import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { TripApiService } from '../../../core/services/api/trip-api.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class BookingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  public translationService = inject(TranslationService);
  public t = this.translationService.translations;
  private tripApiService = inject(TripApiService);
  protected readonly Math = Math;

  bookings = signal<any[]>([]);
  currentPage = signal<number>(1);
  pageSize = signal<number>(25);

  filterForm = this.fb.nonNullable.group({
    search: [''],
    dateFrom: [''],
    dateTo: [''],
    status: ['All Status']
  });

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.tripApiService.listTrips().subscribe(trips => {
      this.bookings.set(trips);
    });
  }

  get hasFilters(): boolean {
    return this.filterForm.value.search !== '' ||
           this.filterForm.value.dateFrom !== '' ||
           this.filterForm.value.dateTo !== '' ||
           this.filterForm.value.status !== 'All Status';
  }

  resetFilters() {
    this.filterForm.reset({
      search: '',
      dateFrom: '',
      dateTo: '',
      status: 'All Status'
    });
    this.currentPage.set(1);
  }

  filteredBookings = computed(() => {
    const filters = this.filterForm.value;
    const all = this.bookings();
    
    return all.filter(b => {
      const searchMatch = !filters.search || 
        b.client_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        b.uuid?.toLowerCase().includes(filters.search.toLowerCase()) ||
        b.id?.toString().includes(filters.search);
        
      const statusMatch = filters.status === 'All Status' || 
        (filters.status === 'Approved' && b.approved) ||
        (filters.status === 'Declined' && b.declined) ||
        (filters.status === 'InProgress' && !b.approved && !b.declined);
        
      return searchMatch && statusMatch;
    });
  });

  totalPages = computed(() => Math.ceil(this.filteredBookings().length / this.pageSize()));

  paginatedBookings = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return this.filteredBookings().slice(startIndex, startIndex + this.pageSize());
  });

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  resetPagination() {
    this.currentPage.set(1);
  }
}

