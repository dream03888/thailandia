import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DateInputComponent } from '../../../core/components/date-input/date-input';
import { TranslationService } from '../../../core/services/translation.service';
import { TripApiService } from '../../../core/services/api/trip-api.service';
import { PdfService } from '../../../core/services/pdf.service';

import { TransferApiService } from '../../../core/services/api/transfer-api.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink, DateInputComponent],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class BookingsComponent implements OnInit {
  private fb = inject(FormBuilder);
  public translationService = inject(TranslationService);
  public authService = inject(AuthService);
  public t = this.translationService.translations;
  private tripApiService = inject(TripApiService);
  private pdfService = inject(PdfService);
  protected readonly Math = Math;

  isAdmin = computed(() => ['admin', 'superadmin'].includes(this.authService.currentUser()?.role || ''));

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
    // Filter strictly for Bookings (is_booking === true)
    const all = this.bookings().filter(b => b.is_booking);
    
    return all.filter(b => {
      const searchMatch = !filters.search || 
        b.client_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        b.uuid?.toLowerCase().includes(filters.search.toLowerCase()) ||
        b.id?.toString().includes(filters.search);
        
      const statusMatch = filters.status === 'All Status' || 
        (filters.status === 'Declined' && b.declined) ||
        (filters.status === 'InProgress' && !b.declined);
        
      return searchMatch && statusMatch;
    });
  });

  // Pagination Calculations
  totalPages = computed(() => {
    const total = this.filteredBookings().length;
    return total === 0 ? 0 : Math.ceil(total / this.pageSize());
  });

  startIndex = computed(() => {
    const total = this.filteredBookings().length;
    return total === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1;
  });

  endIndex = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.filteredBookings().length);
  });

  paginatedBookings = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredBookings().slice(start, start + this.pageSize());
  });

  setPage(page: number) {
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
      if (current > 3) pages.push(-1);
      
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      
      for (let i = start; i <= end; i++) pages.push(i);
      
      if (current < total - 2) pages.push(-1);
      pages.push(total);
    }
    return pages;
  }

  resetPagination() {
    this.currentPage.set(1);
  }

  downloadPdf(id: string) {
    this.tripApiService.getTrip(id).subscribe({
      next: (fullTrip: any) => {
        this.pdfService.generateTripPdf(fullTrip);
      },
      error: (err: any) => {
        console.error('Error fetching trip details for PDF:', err);
      }
    });
  }
}
