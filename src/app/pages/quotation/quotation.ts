import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { QuotationService } from '../../core/services/quotation.service';

@Component({
  selector: 'app-quotation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './quotation.html',
  styleUrl: './quotation.css'
})
export class QuotationComponent {
  private fb = inject(FormBuilder);
  public translationService = inject(TranslationService);
  public quotationService = inject(QuotationService);
  public t = this.translationService.translations;

  quotations = this.quotationService.quotations;

  filterForm = this.fb.nonNullable.group({
    search: [''],
    dateFrom: [''],
    dateTo: [''],
    status: ['']
  });

  get hasFilters(): boolean {
    const v = this.filterForm.value;
    return !!(v.search || v.dateFrom || v.dateTo || v.status);
  }

  resetFilters() {
    this.filterForm.reset({ status: '' });
  }

  deleteQuotation(id: string) {
    if (confirm('Are you sure you want to delete this quotation?')) {
      this.quotationService.deleteQuotation(id);
    }
  }

  clearAll() {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      this.quotationService.clearAll();
    }
  }
}
