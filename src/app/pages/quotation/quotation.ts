import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { TripApiService } from '../../core/services/api/trip-api.service';
import { StatusModalComponent } from '../../core/components/modals/status-modal/status-modal';

@Component({
  selector: 'app-quotation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, StatusModalComponent],
  templateUrl: './quotation.html',
  styleUrl: './quotation.css'
})
export class QuotationComponent implements OnInit {
  private fb = inject(FormBuilder);
  public translationService = inject(TranslationService);
  private tripApiService = inject(TripApiService);
  public t = this.translationService.translations;
  private router = inject(Router);
  protected readonly Math = Math;

  quotations = signal<any[]>([]);

  filterForm = this.fb.nonNullable.group({
    search: [''],
    dateFrom: [''],
    dateTo: [''],
    status: ['']
  });

  // Pagination
  currentPage = signal(1);
  pageSize = signal(10);

  filteredQuotations = computed(() => {
    const list = this.quotations();
    const filters = this.filterForm.value;
    const search = (filters.search || '').toLowerCase();
    
    let result = list;
    if (search) {
      result = result.filter(q => 
        (q.client_name && q.client_name.toLowerCase().includes(search)) ||
        (q.uuid && q.uuid.toLowerCase().includes(search)) ||
        (q.id && q.id.toString().includes(search))
      );
    }
    if (filters.status) {
      result = result.filter(q => q.status?.toLowerCase() === filters.status?.toLowerCase());
    }
    // Date filtering could be added here
    return result;
  });

  paginatedQuotations = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.filteredQuotations().slice(start, start + this.pageSize());
  });

  totalPages = computed(() => Math.ceil(this.filteredQuotations().length / this.pageSize()));

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  ngOnInit() {
    this.loadQuotations();
  }

  loadQuotations() {
    this.tripApiService.listTrips().subscribe(trips => {
      this.quotations.set(trips);
    });
  }

  get hasFilters(): boolean {
    const v = this.filterForm.value;
    return !!(v.search || v.dateFrom || v.dateTo || v.status);
  }

  resetFilters() {
    this.filterForm.reset({ status: '' });
  }

  isStatusModalOpen = signal(false);
  selectedQuoteId = signal<string | number | null>(null);
  selectedQuoteStatus = signal<string>('Pending');

  openStatusModal(quote: any) {
    this.selectedQuoteId.set(quote.id);
    this.selectedQuoteStatus.set(quote.status);
    this.isStatusModalOpen.set(true);
  }

  closeStatusModal() {
    this.isStatusModalOpen.set(false);
    this.selectedQuoteId.set(null);
  }

  saveStatus(newStatus: string) {
    const id = this.selectedQuoteId();
    if (id) {
       this.tripApiService.updateTripStatus(id, newStatus).subscribe(() => {
         this.loadQuotations();
         this.closeStatusModal();
       });
    }
  }

  deleteQuotation(id: string | number) {
    if (confirm('Are you sure you want to delete this quotation?')) {
      this.tripApiService.deleteTrip(id).subscribe(() => {
        this.loadQuotations();
      });
    }
  }

  clearAll() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      this.quotations.set([]);
    }
  }

  emailAgent(id: string | number) {
    const q = this.quotations().find(item => item.id === id);
    if (q) {
      alert(`Email update sent to Agent for ${q.clientName || 'Client'} (Ref: ${q.ref || 'N/A'})!`);
    } else {
      alert('Email sent successfully!');
    }
  }

  viewQuotation(uuid: string) {
    this.router.navigate(['/itinerary'], { queryParams: { uuid } });
  }

  editQuotation(id: string | number) {
    this.router.navigate(['/add-quotation', id]);
  }
}
