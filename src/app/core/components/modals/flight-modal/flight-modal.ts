import { Component, ChangeDetectionStrategy, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslationService } from '../../../../core/services/translation.service';

@Component({
  selector: 'app-flight-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './flight-modal.html',
  styleUrl: './flight-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlightModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  public translationService = inject(TranslationService);
  public t = this.translationService.translations;

  flightForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.flightForm = this.fb.group({
      flight: [''],
      number: [''],
      flightInOut: [''],
      route: [''],
      dateOfTravel: [''],
      departureTime: [''],
      arrivalTime: [''],
      issuedBy: [''],
      cost: [0],
      remarks: ['']
    });
  }

  onClose() {
    this.close.emit();
  }

  onSave() {
    this.save.emit(this.flightForm.value);
  }
}
