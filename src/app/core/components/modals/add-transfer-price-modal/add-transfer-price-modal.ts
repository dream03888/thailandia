import { Component, ChangeDetectionStrategy, inject, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../services/translation.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-transfer-price-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-transfer-price-modal.html',
  styleUrl: './add-transfer-price-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddTransferPriceModalComponent {
  isOpen = input.required<boolean>();
  
  close = output<void>();
  save = output<any>();

  private translationService = inject(TranslationService);
  private fb = inject(FormBuilder);
  public t = this.translationService.translations;

  priceForm = this.fb.group({
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    pax: [null as number | null, [Validators.required, Validators.min(1)]],
    price: [null as number | null, [Validators.required, Validators.min(0)]]
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.priceForm.reset();
      }
    });
  }

  onCancel() {
    this.close.emit();
  }

  onSave() {
    if (this.priceForm.valid) {
      this.save.emit(this.priceForm.value);
    } else {
      Object.values(this.priceForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }
}
