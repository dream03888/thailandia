import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslationService } from '../../core/services/translation.service';
import { PaymentService, Payment } from '../../core/services/payment.service';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentComponent {
  public translationService = inject(TranslationService);
  public t = this.translationService.translations;
  public paymentService = inject(PaymentService);

  searchQuery = signal('');
  dateFrom = signal('');
  dateTo = signal('');

  hasActiveFilters = signal(false);

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
    console.log('Searching payments...');
  }

  onUpdate(payment: Payment) {
    const updated = { ...payment, amtPaid: payment.amtPaid + 1000, balance: payment.balance - 1000 };
    this.paymentService.updatePayment(updated);
  }
}
