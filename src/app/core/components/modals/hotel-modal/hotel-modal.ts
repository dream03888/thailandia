import { Component, output, inject, ChangeDetectionStrategy, signal, computed, input, OnInit, effect } from '@angular/core';
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
export class HotelModalComponent implements OnInit {
  public translationService = inject(TranslationService);
  public masterData = inject(MasterDataService);
  private fb = inject(FormBuilder);
  private hotelApi = inject(HotelApiService);

  initialData = input<any>(null);
  public t = this.translationService.translations;

  close = output<void>();
  save = output<any>();

  selectedCity = signal<string>('');
  roomTypesList = signal<any[]>([]);
  promotionsList = signal<any[]>([]);
  private isPatching = false;

  filteredHotels = computed(() => {
    const city = this.selectedCity();
    if (!city || city === 'Select city') return this.masterData.hotels();
    return this.masterData.hotels().filter((h: any) => h.city === city);
  });

  // Comparison functions for select elements
  compareById = (o1: any, o2: any): boolean => {
    return o1 && o2 ? String(o1) === String(o2) : o1 === o2;
  };

  compareByName = (o1: any, o2: any): boolean => {
    return o1 && o2 ? String(o1).trim() === String(o2).trim() : o1 === o2;
  };

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
      if (this.isPatching) return;
      this.selectedCity.set(val);
      this.hotelForm.patchValue({ hotel: '' }, { emitEvent: false });
      this.roomTypesList.set([]);
      this.promotionsList.set([]);
    });

    this.hotelForm.get('hotel')?.valueChanges.subscribe(val => {
      if (val && !this.isPatching) {
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
  }

  ngOnInit() {
    if (this.initialData()) {
      this.isPatching = true;
      const d = this.initialData();
      
      // 1. Set city first to trigger filteredHotels signal
      this.selectedCity.set(d.city);
      
      // Force read to make data available synchronously
      const availableHotels = this.filteredHotels();
      
      // Robust matching for hotel ID
      let hId = d.hotel_id;
      if (!hId && d.hotel) {
         const matched = availableHotels.find((h: any) => h.name === d.hotel);
         if (matched) hId = matched.id;
      }

      // 2. Patch non-dropdown fields immediately
      this.hotelForm.patchValue({
        checkIn: d.checkIn,
        checkOut: d.checkOut,
        city: d.city,
        hotel: hId,
        nights: d.nights,
        single: d.singleRoom,
        double: d.doubleRoom,
        promotion: d.promotion,
        price: d.price,
        discount: d.discount || 0,
        notes: d.notes || d.remarks || '',
        earlyCheckIn: !!d.earlyCheckIn,
        lateCheckOut: !!d.lateCheckOut,
        flightIn: d.flightIn || '',
        flightOut: d.flightOut || '',
        flightInfo: d.flightInfo || ''
      }, { emitEvent: false });

      // 3. Patch Meals with structural safety
      if (d.meals) {
        this.hotelForm.get('meals')?.patchValue({
          hasAbf: !!d.meals.hasAbf,
          hasLunch: !!d.meals.hasLunch,
          hasDinner: !!d.meals.hasDinner,
          hasAllInclusive: !!d.meals.hasAllInclusive,
          abfDays: d.meals.abfDays || 0,
          lunchDays: d.meals.lunchDays || 0,
          dinnerDays: d.meals.dinnerDays || 0,
          allInclusiveDays: d.meals.allInclusiveDays || 0,
          abfNotes: d.meals.abfNotes || '',
          lunchNotes: d.meals.lunchNotes || '',
          dinnerNotes: d.meals.dinnerNotes || '',
          allInclusiveNotes: d.meals.allInclusiveNotes || ''
        });
      }

      // 4. Initial Room Types setup (might render "Select Room Type" if options missing)
      this.patchRoomTypes(d);

      // 5. Load async details and re-patch once done
      if (hId) {
        this.updateHotelDetails(hId, d);
      } else {
        this.isPatching = false;
      }
    }
  }

  private patchRoomTypes(d: any) {
    if (d.roomTypes && Array.isArray(d.roomTypes) && d.roomTypes.length > 0) {
      this.roomTypes.clear();
      d.roomTypes.forEach((rt: any) => {
        this.roomTypes.push(this.fb.group({
          roomType: [rt.roomType, Validators.required],
          adults: [rt.adults || 0],
          children: [rt.children || 0],
          compAbf: [rt.compAbf || false],
          extraAdultBed: [rt.extraAdultBed || false],
          extraChildBed: [rt.extraChildBed || false],
          sharingBed: [rt.sharingBed || false]
        }));
      });
    } else if (d.roomType) {
      this.roomTypes.clear();
      this.roomTypes.push(this.fb.group({
        roomType: [d.roomType, Validators.required],
        adults: [d.adults || 0],
        children: [d.children || 0],
        compAbf: [d.compAbf || false],
        extraAdultBed: [d.extraAdultBed || false],
        extraChildBed: [d.extraChildBed || false],
        sharingBed: [d.sharingBed || false]
      }));
    }
  }

  updateHotelDetails(hotelId: string | number, initialDataToPatch?: any) {
    this.hotelApi.getHotel(hotelId).subscribe({
      next: (details: any) => {
        this.roomTypesList.set(details.roomTypes || []);
        this.promotionsList.set(details.promotions || []);
        
        // Re-apply room types & promotions so Angular selects the newly loaded options
        if (this.isPatching && initialDataToPatch) {
          setTimeout(() => {
            if (initialDataToPatch.promotion) {
               this.hotelForm.patchValue({ promotion: initialDataToPatch.promotion }, { emitEvent: false });
            }
            this.patchRoomTypes(initialDataToPatch);
            this.isPatching = false;
          }, 0);
        }
      },
      error: (err) => {
        console.error('Error fetching hotel details:', err);
        this.roomTypesList.set([]);
        this.promotionsList.set([]);
        if (this.isPatching) this.isPatching = false;
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
