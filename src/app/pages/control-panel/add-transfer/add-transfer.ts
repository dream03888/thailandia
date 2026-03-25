import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AddTransferPriceModalComponent } from '../../../core/components/modals/add-transfer-price-modal/add-transfer-price-modal';

@Component({
  selector: 'app-add-transfer',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AddTransferPriceModalComponent],
  templateUrl: './add-transfer.html',
  styleUrl: './add-transfer.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddTransferComponent {
  private translationService = inject(TranslationService);
  private fb = inject(FormBuilder);
  public t = this.translationService.translations;

  transferForm = this.fb.group({
    type: ['', Validators.required],
    country: ['Thailand', Validators.required],
    city: ['', Validators.required],
    supplier: ['', Validators.required],
    description: ['', Validators.required],
    departureLocation: ['', Validators.required],
    arrivalLocation: ['', Validators.required],
    sicPriceAdult: [null as number | null, [Validators.required, Validators.min(0)]],
    sicPriceChild: [null as number | null, [Validators.required, Validators.min(0)]],
    displayOrder: ['']
  });

  transferPrices = signal<any[]>([]);
  isPriceModalOpen = signal(false);

  openAddPriceModal() {
    this.isPriceModalOpen.set(true);
  }

  handlePriceSave(priceData: any) {
    this.transferPrices.update(prices => [...prices, { ...priceData, id: Date.now() }]);
    this.isPriceModalOpen.set(false);
  }

  removePrice(id: number) {
    this.transferPrices.update(prices => prices.filter(p => p.id !== id));
  }

  onSubmit() {
    if (this.transferForm.valid) {
      console.log('Form data:', this.transferForm.value);
      console.log('Pricing data:', this.transferPrices());
      alert('Transfer saved successfully!');
    } else {
      this.transferForm.markAllAsTouched();
    }
  }
}
