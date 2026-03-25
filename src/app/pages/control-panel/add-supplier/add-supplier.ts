import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-add-supplier',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-supplier.html',
  styleUrl: './add-supplier.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddSupplierComponent {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private translationService = inject(TranslationService);
  public t = this.translationService.translations;

  supplierForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    country: ['Thailand', Validators.required],
    location: ['', Validators.required],
    description: [''],
    // Service Types
    serviceTransfers: [false],
    serviceExcursions: [false],
    serviceTours: [false],
    // Policy
    cancellationDays: [3, [Validators.required, Validators.min(-1)]],
    paymentDays: [1, [Validators.required, Validators.min(0)]]
  });

  policyPreview = computed(() => {
    const cancel = this.supplierForm.get('cancellationDays')?.value as number;
    const payment = this.supplierForm.get('paymentDays')?.value as number;
    
    let cancelText = '';
    if (cancel === -1) {
      cancelText = 'No cancellation allowed.';
    } else {
      cancelText = `Cancellation allowed until ${cancel} days before travel.`;
    }
    
    let paymentText = '';
    if (payment === 0) {
      paymentText = 'Payment due on travel date.';
    } else {
      paymentText = `Payment due ${payment} day${payment > 1 ? 's' : ''} before travel.`;
    }
    
    return `Cancellation: ${cancelText} | Payment: ${paymentText}`;
  });

  goBack() {
    this.location.back();
  }

  saveSupplier() {
    if (this.supplierForm.valid) {
      console.log('Supplier Data:', this.supplierForm.value);
      this.goBack();
    } else {
      this.supplierForm.markAllAsTouched();
    }
  }
}
