import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';

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
  public t = this.translationService.translations;

  filterForm = this.fb.nonNullable.group({
    search: [''],
    dateFrom: [''],
    dateTo: [''],
    status: ['All Status']
  });

  get hasFilters(): boolean {
    const v = this.filterForm.value;
    return !!(v.search || v.dateFrom || v.dateTo || (v.status && v.status !== 'All Status'));
  }

  resetFilters() {
    this.filterForm.reset({ status: 'All Status' });
  }

  // Data for the table as seen in the mockup
  quotations = [
    {
      ref: 'Q2025DEC1897V4',
      clientName: 'Ms. MANUNTA DANIELA x4',
      bookingDate: '18/12/2025',
      tripStartDate: '18/12/2025',
      pax: 4,
      telephone: '+971547890911',
      bookingRef: 'DEC79_2568',
      status: 'Pending',
      finalCost: 5200
    },
    {
      ref: 'Q2026FEB12WF2K',
      clientName: 'Mr. AMATO PAOLO / Ms. MIRABILE EMANUELA',
      bookingDate: '12/02/2026',
      tripStartDate: '06/03/2026',
      pax: 2,
      telephone: '+39 389 518 9830',
      bookingRef: 'MAR08_2569',
      status: 'Approved',
      finalCost: 11800
    }
  ];
}
