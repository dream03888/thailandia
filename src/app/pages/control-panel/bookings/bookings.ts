import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { QuotationService } from '../../../core/services/quotation.service';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class BookingsComponent {
  private fb = inject(FormBuilder);
  public translationService = inject(TranslationService);
  public t = this.translationService.translations;
  private quotationService = inject(QuotationService);

  bookings = this.quotationService.quotations;

  filterForm = this.fb.nonNullable.group({
    search: [''],
    dateFrom: [''],
    dateTo: [''],
    status: ['All Status']
  });

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
  }
}

