import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-add-other-charge',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-other-charge.html',
  styleUrl: './add-other-charge.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddOtherChargeComponent {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private translationService = inject(TranslationService);
  public t = this.translationService.translations;

  chargeForm = this.fb.group({
    description: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0)]],
    type: ['', Validators.required]
  });

  goBack() {
    this.location.back();
  }

  saveCharge() {
    if (this.chargeForm.valid) {
      console.log('Charge Data:', this.chargeForm.value);
      this.goBack();
    } else {
      this.chargeForm.markAllAsTouched();
    }
  }
}
