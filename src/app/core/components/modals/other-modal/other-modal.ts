import { Component, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-other-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './other-modal.html',
  styleUrl: './other-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OtherModalComponent {
  private translationService = inject(TranslationService);
  private fb = inject(FormBuilder);
  public t = this.translationService.translations;
  
  close = output<void>();
  save = output<any>();

  otherForm: FormGroup;

  constructor() {
    this.otherForm = this.fb.group({
      description: ['', Validators.required],
      date: [''],
      cost: [0],
      totalPrice: ['', Validators.required],
      remarks: ['']
    });
  }

  onSave() {
    if (this.otherForm.valid) {
      this.save.emit(this.otherForm.getRawValue());
    } else {
      this.otherForm.markAllAsTouched();
    }
  }
}
