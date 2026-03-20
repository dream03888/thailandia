import { Component, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-transfer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfer-modal.html',
  styleUrl: './transfer-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferModalComponent {
  private translationService = inject(TranslationService);
  private fb = inject(FormBuilder);
  public t = this.translationService.translations;
  
  close = output<void>();
  save = output<any>();

  transferForm: FormGroup;

  constructor() {
    this.transferForm = this.fb.group({
      country: ['', Validators.required],
      city: ['', Validators.required],
      date: ['', Validators.required],
      transfer: ['', Validators.required],
      from: [''],
      to: [''],
      flight: [''],
      flightTime: [''],
      tot: ['', Validators.required],
      pickupTime: [''],
      price: [{value: '', disabled: true}],
      remarks: ['']
    });
  }

  getPrice() {
    // Example: Mock get price logic
    this.transferForm.patchValue({ price: 2500 });
  }

  onSave() {
    if (this.transferForm.valid) {
      this.save.emit(this.transferForm.getRawValue());
    }
  }
}
