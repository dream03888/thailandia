import { Component, output, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslationService } from '../../../services/translation.service';
import { MasterDataService } from '../../../services/master-data.service';
import { HotelApiService } from '../../../services/api/hotel-api.service';

@Component({
  selector: 'app-hotel-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './hotel-modal.html',
  styleUrl: './hotel-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelModalComponent {
  public translationService = inject(TranslationService);
  public masterData = inject(MasterDataService);
  private fb = inject(FormBuilder);
  private hotelApi = inject(HotelApiService);
  public t = this.translationService.translations;

  close = output<void>();
  save = output<any>();

  selectedCity = signal<string>('');
  roomTypesList = signal<any[]>([]);
  promotionsList = signal<any[]>([]);

  filteredHotels = computed(() => {
    const city = this.selectedCity();
    if (!city || city === 'Select city') return this.masterData.hotels();
    return this.masterData.hotels().filter((h: any) => h.city === city);
  });

  hotelForm: FormGroup;

  constructor() {
    this.hotelForm = this.fb.group({
      checkIn: ['', Validators.required],
      checkOut: ['', Validators.required],
      country: ['Thailand', Validators.required],
      city: ['', Validators.required],
      hotel: ['', Validators.required], // Will store hotel ID
      nights: [{value: 0, disabled: true}],
      pax: [{value: 0, disabled: true}],
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
      price: [{value: 0, disabled: true}],
      discount: [0],
      notes: ['']
    });

    // Subscriptions for reactivity
    this.hotelForm.get('city')?.valueChanges.subscribe(val => {
      this.selectedCity.set(val);
      this.hotelForm.patchValue({ hotel: '' }, { emitEvent: false });
      this.roomTypesList.set([]);
      this.promotionsList.set([]);
    });

    this.hotelForm.get('hotel')?.valueChanges.subscribe(val => {
      if (val) {
        this.updateHotelDetails(val);
      }
    });

    this.hotelForm.get('checkIn')?.valueChanges.subscribe(() => this.calculateNights());
    this.hotelForm.get('checkOut')?.valueChanges.subscribe(() => this.calculateNights());
    this.hotelForm.get('single')?.valueChanges.subscribe(() => this.calculatePax());
    this.hotelForm.get('double')?.valueChanges.subscribe(() => this.calculatePax());

    // Initial values
    const city = this.hotelForm.get('city')?.value;
    if (city) this.selectedCity.set(city);
    
    const hotelId = this.hotelForm.get('hotel')?.value;
    if (hotelId) this.updateHotelDetails(hotelId);
  }

  updateHotelDetails(hotelId: string | number) {
    this.hotelApi.getHotel(hotelId).subscribe({
      next: (details: any) => {
        this.roomTypesList.set(details.roomTypes || []);
        this.promotionsList.set(details.promotions || []);
      },
      error: (err) => {
        console.error('Error fetching hotel details:', err);
        this.roomTypesList.set([]);
        this.promotionsList.set([]);
      }
    });
  }

  calculateNights() {
    const checkIn = this.hotelForm.get('checkIn')?.value;
    const checkOut = this.hotelForm.get('checkOut')?.value;
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.hotelForm.patchValue({ nights: diffDays > 0 ? diffDays : 0 });
    }
  }

  calculatePax() {
    const single = Number(this.hotelForm.get('single')?.value || 0);
    const double = Number(this.hotelForm.get('double')?.value || 0);
    this.hotelForm.patchValue({ pax: single + (double * 2) });
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
      // Before saving, we might want to attach the hotel name if needed
      const hotelId = this.hotelForm.get('hotel')?.value;
      const hotelObj = this.masterData.hotels().find(h => h.id == hotelId);
      const data = this.hotelForm.getRawValue();
      data.hotel_name = hotelObj ? hotelObj.name : '';
      data.hotel_id = hotelId;
      this.save.emit(data);
    } else {
      this.hotelForm.markAllAsTouched();
    }
  }
}
