import { Component, ChangeDetectionStrategy, input, output, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-add-excursion-price-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-excursion-price-modal.html',
  styleUrl: './add-excursion-price-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddExcursionPriceModalComponent {
  isOpen = input.required<boolean>();
  priceData = input<any>(null);
  
  close = output<void>();
  save = output<any>();

  private translationService = inject(TranslationService);
  public t = this.translationService.translations;
  private fb = inject(FormBuilder);

  form = this.fb.group({
    dateFrom: ['', Validators.required],
    dateTo: ['', Validators.required],
    pax: ['', Validators.required],
    price: ['', Validators.required]
  });

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        const pd = this.priceData();
        if (pd) {
          this.form.patchValue({
            dateFrom: pd.dateFrom,
            dateTo: pd.dateTo,
            pax: pd.pax,
            price: pd.price
          });
        } else {
          this.form.reset();
        }
      }
    });
  }

  onSave() {
    if (this.form.valid) {
      this.save.emit(this.form.value);
    } else {
      this.form.markAllAsTouched();
    }
  }

  onClose() {
    this.close.emit();
  }
}
