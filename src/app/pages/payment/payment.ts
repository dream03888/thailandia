import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DateInputComponent } from '../../core/components/date-input/date-input';
import { TranslationService } from '../../core/services/translation.service';
import { PaymentApiService } from '../../core/services/api/payment-api.service';

@Component({
  selector: 'app-payment',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DateInputComponent],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentComponent implements OnInit {
  public translationService = inject(TranslationService);
  private paymentApiService = inject(PaymentApiService);
  public t = this.translationService.translations;

  searchQuery = signal('');
  dateFrom = signal('');
  dateTo = signal('');

  hasActiveFilters = signal(false);
  paymentsList = signal<any[]>([]);

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.paymentApiService.listPayments().subscribe({
      next: (payments) => {
        this.paymentsList.set(payments);
      },
      error: (err) => {
        console.error('Error loading payments:', err);
      }
    });
  }

  filteredPayments = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.paymentsList().filter((p: any) => 
      (p.bookingRef && p.bookingRef.toLowerCase().includes(query)) || 
      (p.agent && p.agent.toLowerCase().includes(query)) ||
      (p.clientName && p.clientName.toLowerCase().includes(query))
    );
  });

  checkFilters() {
    this.hasActiveFilters.set(
      this.searchQuery().trim() !== '' ||
      this.dateFrom() !== '' ||
      this.dateTo() !== ''
    );
  }

  resetFilters() {
    this.searchQuery.set('');
    this.dateFrom.set('');
    this.dateTo.set('');
    this.hasActiveFilters.set(false);
  }
  
  onSearch() {
    this.checkFilters();
  }

  onUpdate(payment: any) {
    // Demo update logic - in real app would open a modal or inline edit
    const amountToPay = 1000;
    const updated = { 
      ...payment, 
      amtPaid: (Number(payment.amtPaid) || 0) + amountToPay, 
      balance: (Number(payment.balance) || 0) - amountToPay 
    };
    
    this.paymentApiService.updatePayment(payment.id, updated).subscribe({
      next: () => {
        this.loadPayments();
      },
      error: (err) => {
        console.error('Error updating payment:', err);
        alert('Failed to update payment');
      }
    });
  }

  downloadInvoice(id: string | number) {
    this.paymentApiService.generateInvoice(id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
    });
  }
}
