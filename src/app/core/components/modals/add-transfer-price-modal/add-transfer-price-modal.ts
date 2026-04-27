import { Component, ChangeDetectionStrategy, inject, input, output, effect, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateInputComponent } from '../../date-input/date-input';
import { TranslationService } from '../../../services/translation.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-transfer-price-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DateInputComponent],
  templateUrl: './add-transfer-price-modal.html',
  styleUrl: './add-transfer-price-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddTransferPriceModalComponent {
  isOpen = input.required<boolean>();
  priceData = input<any>(null);
  
  close = output<void>();
  save = output<any>();

  private translationService = inject(TranslationService);
  private fb = inject(FormBuilder);
  public t = this.translationService.translations;

  modalTitle = computed(() => {
    return this.priceData() 
      ? (this.t()['transfer.editPriceTitle'] || 'Edit Price') 
      : (this.t()['transfer.addPriceTitle'] || 'Add Price');
  });

  priceForm = this.fb.group({
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    pax: [null as number | null, [Validators.required, Validators.min(1)]],
    price: [null as number | null, [Validators.required, Validators.min(0)]]
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const data = this.priceData();
        if (data) {
          this.priceForm.patchValue({
            dateFrom: data.dateFrom || '',
            dateTo: data.dateTo || '',
            pax: data.pax || null,
            price: data.price || null
          });
        } else {
          this.priceForm.reset();
        }
      }
    });
  }

  onCancel() {
    this.close.emit();
  }

  errorMessage = signal<string | null>(null);

  onSave() {
    if (this.priceForm.valid) {
      this.errorMessage.set(null);
      this.save.emit(this.priceForm.value);
    } else {
      this.errorMessage.set('Please fill in all required fields.');
      Object.values(this.priceForm.controls).forEach(control => {
        control.markAsTouched();
      });
      setTimeout(() => {
        const firstInvalidControl = document.querySelector('.ng-invalid');
        if (firstInvalidControl) {
          (firstInvalidControl as HTMLElement).focus();
        }
      }, 100);
    }
  }
}
