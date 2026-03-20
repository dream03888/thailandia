import { Component, output, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-hotel-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './hotel-modal.html',
  styleUrl: './hotel-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelModalComponent {
  private translationService = inject(TranslationService);
  private fb = inject(FormBuilder);
  public t = this.translationService.translations;
  
  close = output<void>();
  save = output<any>();

  hotelForm: FormGroup;

  constructor() {
    this.hotelForm = this.fb.group({
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
      country: ['', Validators.required],
      city: ['', Validators.required],
      hotel: ['', Validators.required],
      nights: [{value: '', disabled: true}],
      pax: [{value: '', disabled: true}],
      single: [0],
      double: [0],
      earlyCheckIn: [false],
      lateCheckOut: [false],
      roomTypes: this.fb.array([this.createRoomType()]),
      promotion: [''],
      meals: this.fb.group({
        hasAbf: [false],
        hasLunch: [false],
        hasDinner: [false],
        hasAllInclusive: [false],
        abfDays: [0],
        lunchDays: [0],
        dinnerDays: [0],
        allInclusiveDays: [0],
        abfNotes: [''],
        lunchNotes: [''],
        dinnerNotes: [''],
        allInclusiveNotes: ['']
      }),
      flightIn: [''],
      flightOut: [''],
      flightInfo: [''],
      price: [{value: '', disabled: true}],
      discount: [''],
      notes: ['']
    });
  }

  get roomTypes() {
    return this.hotelForm.get('roomTypes') as FormArray;
  }

  createRoomType(): FormGroup {
    return this.fb.group({
      roomType: ['', Validators.required],
      adults: [0],
      children: [0],
      compAbf: [false],
      extraAdultBed: [false],
      extraChildBed: [false],
      sharingBed: [false]
    });
  }

  addRoomType() {
    this.roomTypes.push(this.createRoomType());
  }

  removeRoomType(i: number) {
    if (this.roomTypes.length > 1) {
      this.roomTypes.removeAt(i);
    }
  }

  getPrice() {
    this.hotelForm.patchValue({ price: 5000 });
  }

  onSave() {
    if (this.hotelForm.valid) {
      this.save.emit(this.hotelForm.getRawValue());
    } else {
      this.hotelForm.markAllAsTouched();
    }
  }
}
