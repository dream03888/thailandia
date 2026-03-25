import { Component, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-excursion-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './excursion-modal.html',
  styleUrl: './excursion-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExcursionModalComponent {
  private translationService = inject(TranslationService);
  private fb = inject(FormBuilder);
  public t = this.translationService.translations;
  
  close = output<void>();
  save = output<any>();

  excursionForm: FormGroup;

  constructor() {
    this.excursionForm = this.fb.group({
      country: ['', Validators.required],
      city: ['', Validators.required],
      date: ['', Validators.required],
      excursion: ['', Validators.required],
      hotel: ['', Validators.required],
      pickupTime: [''],
      typeOfExcursion: ['', Validators.required],
      price: [{value: 0, disabled: ''}],
      remarks: ['']
    });
  }

  getPrice() {
    this.excursionForm.patchValue({ price: 1500 });
  }

  onSave() {
    if (this.excursionForm.valid) {
      this.save.emit(this.excursionForm.getRawValue());
    } else {
      this.excursionForm.markAllAsTouched();
    }
  }
}
