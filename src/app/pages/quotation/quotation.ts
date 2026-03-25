import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';
import { QuotationService } from '../../core/services/quotation.service';
import { StatusModalComponent } from '../../core/components/modals/status-modal/status-modal';

@Component({
  selector: 'app-quotation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, StatusModalComponent],
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

  isStatusModalOpen = signal(false);
  selectedQuoteId = signal<string | null>(null);
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
      this.quotationService.updateQuotation(id, { status: newStatus as any });
    }
    this.closeStatusModal();
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

  emailAgent(id: string) {
    const q = this.quotationService.getQuotationById(id);
    if (q) {
      alert(`Email update sent to Agent for ${q.clientName} (Ref: ${q.ref})!`);
    } else {
      alert('Email sent successfully!');
    }
  }
}
