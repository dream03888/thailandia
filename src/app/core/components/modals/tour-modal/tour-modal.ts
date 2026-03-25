import { Component, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-tour-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tour-modal.html',
  styleUrl: './tour-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TourModalComponent {
  private translationService = inject(TranslationService);
  private fb = inject(FormBuilder);
  public t = this.translationService.translations;
  
  close = output<void>();
  save = output<any>();

  tourForm: FormGroup;

  constructor() {
    this.tourForm = this.fb.group({
      country: ['', Validators.required],
      startCity: ['', Validators.required],
      tour: ['', Validators.required],
      route: [''],
      startDate: [''],
      endDate: [''],
      singleRoom: [false],
      singleRoomCount: [0],
      doubleRoom: [false],
      doubleRoomCount: [0],
      tripleRoom: [false],
      tripleRoomCount: [0],
      pax: [{value: 0, disabled: ''}],
      tot: ['', Validators.required],
      flightIn: [''],
      arrivalTime: [''],
      flightOut: [''],
      departureTime: [''],
      price: [{value: 0, disabled: ''}],
      remarks: ['']
    });
  }

  getPrice() {
    this.tourForm.patchValue({ price: 8500 });
  }

  onSave() {
    if (this.tourForm.valid) {
      this.save.emit(this.tourForm.getRawValue());
    } else {
      this.tourForm.markAllAsTouched();
    }
  }
}
