import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-add-hotel-promo-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-hotel-promo-modal.html',
  styleUrl: './add-hotel-promo-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddHotelPromoModalComponent {
  private fb = inject(FormBuilder);
  private translationService = inject(TranslationService);
  public t = this.translationService.translations;

  @Input() isOpen = false;
  @Input() set promoData(data: unknown | null) {
    const d = data as Record<string, unknown> | null;
    if (d) {
      this.promoForm.patchValue(d);
      this.editIndex = d['id'] !== undefined ? d['id'] as number : null;
    } else {
      this.promoForm.reset({
        earlyBird: 0,
        minNights: 0,
        discountAmount: 0,
        discountType: '%',
        validForExtraBed: false,
        enabled: true,
        freeMealsAbf: 0,
        freeMealsLunch: 0,
        freeMealsDinner: 0,
        description: ''
      });
      this.editIndex = null;
    }
  }

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<unknown>();

  editIndex: number | null = null;

  promoForm: FormGroup = this.fb.group({
    code: ['', Validators.required],
    name: ['', Validators.required],
    bookingDateFrom: ['', Validators.required],
    bookingDateTo: ['', Validators.required],
    earlyBird: [0],
    minNights: [0],
    discountAmount: [0],
    discountType: ['%'],
    validForExtraBed: [false],
    enabled: [true],
    freeMealsAbf: [0],
    freeMealsLunch: [0],
    freeMealsDinner: [0],
    description: ['']
  });

  closeModal() {
    this.close.emit();
  }

  onSubmit() {
    if (this.promoForm.valid) {
      const data: Record<string, unknown> = { ...this.promoForm.value };
      if (this.editIndex !== null) {
        data['id'] = this.editIndex;
      }
      this.save.emit(data);
      this.promoForm.reset({
        earlyBird: 0,
        minNights: 0,
        discountAmount: 0,
        discountType: '%',
        validForExtraBed: false,
        enabled: true,
        freeMealsAbf: 0,
        freeMealsLunch: 0,
        freeMealsDinner: 0,
        description: ''
      });
    } else {
      this.promoForm.markAllAsTouched();
    }
  }
}
