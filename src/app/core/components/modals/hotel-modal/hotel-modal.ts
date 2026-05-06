import { Component, output, inject, ChangeDetectionStrategy, signal, computed, input, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateInputComponent } from '../../date-input/date-input';
import { TranslationService } from '../../../services/translation.service';
import { MasterDataService } from '../../../services/master-data.service';
import { HotelApiService } from '../../../services/api/hotel-api.service';
import { MarkupCalculatorService } from '../../../services/markup-calculator.service';

@Component({
  selector: 'app-hotel-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DateInputComponent],
  templateUrl: './hotel-modal.html',
  styleUrl: './hotel-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelModalComponent implements OnInit {
  public translationService = inject(TranslationService);
  public masterData = inject(MasterDataService);
  private fb = inject(FormBuilder);
  private hotelApi = inject(HotelApiService);
  private markupCalc = inject(MarkupCalculatorService);

  initialData = input<any>(null);
  minDate = input<string>('');
  agentMarkup = input<any>(null);
  numberOfAdults = input<number>(0);
  numberOfChildren = input<number>(0);
  public t = this.translationService.translations;

  /** Adults ที่กรอกไปแล้วในทุก room type รวมกัน */
  totalAdultsInRooms = computed(() => {
    const controls = this.hotelForm?.get('roomTypes') as FormArray;
    if (!controls) return 0;
    return controls.controls.reduce((sum, c) => sum + (Number((c as FormGroup).get('adults')?.value) || 0), 0);
  });

  /** Children ที่กรอกไปแล้วในทุก room type รวมกัน */
  totalChildrenInRooms = computed(() => {
    const controls = this.hotelForm?.get('roomTypes') as FormArray;
    if (!controls) return 0;
    return controls.controls.reduce((sum, c) => sum + (Number((c as FormGroup).get('children')?.value) || 0), 0);
  });

  /** Adults ที่เหลือยังกรอกได้ */
  remainingAdults = computed(() => this.numberOfAdults() - this.totalAdultsInRooms());

  /** Children ที่เหลือยังกรอกได้ */
  remainingChildren = computed(() => this.numberOfChildren() - this.totalChildrenInRooms());

  close = output<void>();
  save = output<any>();

  selectedCity = signal<string>('');
  roomTypesList = signal<any[]>([]);
  promotionsList = signal<any[]>([]);
  private isPatching = false;
  isLoading = signal(false);

  hotelSearchQuery = signal<string>('');
  showHotelResults = signal<boolean>(false);

  filteredHotels = computed(() => {
    const city = this.selectedCity();
    const query = this.hotelSearchQuery().toLowerCase().trim();
    
    // Filter by city first
    const hotelsInCity = this.masterData.hotels().filter((h: any) => 
      !city || city === 'Select city' || city === '' || String(h.city).toLowerCase() === String(city).toLowerCase()
    );

    if (!query) return hotelsInCity.slice(0, 10); // Show top 10 if no query
    
    return hotelsInCity.filter((h: any) => 
      h.name.toLowerCase().includes(query)
    ).slice(0, 20); // Limit to 20 results for performance
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
      display_order: [0],
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

    // Effect to handle initialData changes (for Persistent Modal)
    effect(() => {
      const d = this.initialData();
      if (d) {
        this.isPatching = true;
        this.patchForm(d);
        this.isPatching = false;
      } else {
        this.hotelForm.reset({ 
          country: 'Thailand',
          single: 0,
          double: 0,
          meals: {
            hasAbf: false,
            hasLunch: false,
            hasDinner: false,
            hasAllInclusive: false,
            abfDays: 0,
            lunchDays: 0,
            dinnerDays: 0,
            allInclusiveDays: 0
          }
        });
        this.hotelSearchQuery.set('');
        this.roomTypes.clear();
        this.roomTypes.push(this.createRoomType());
      }
    });

    // Effect to re-patch once master data or room types arrive
    effect(() => {
      const hotels = this.masterData.hotels();
      const cities = this.masterData.cities();
      if (this.isPatching && (hotels.length > 0 || cities.length > 0)) {
        this.repatchOnDataLoad();
      }
    });
  }

  repatchOnDataLoad() {
    if (!this.isPatching) return;
    const d = this.initialData();
    if (!d) return;

    // Re-verify hotel ID match
    let hId = d.hotel_id;
    if (!hId && d.hotel) {
       const matched = this.masterData.hotels().find((h: any) => h.name === d.hotel);
       if (matched) hId = matched.id;
    }

    if (hId) {
      this.hotelForm.patchValue({ 
        city: d.city,
        hotel: hId 
      }, { emitEvent: false });
      this.selectedCity.set(d.city);
    }
  }

  ngOnInit() {
    const d = this.initialData();
    if (d) this.patchForm(d);
  }

  patchForm(d: any) {
    if (!d) return;
    
    // Synchronous patching from provided data
    this.selectedCity.set(d.city || '');
    
    this.hotelForm.patchValue({
      checkIn: d.checkIn || '',
      checkOut: d.checkOut || '',
      city: d.city || '',
      nights: d.nights || 0,
      single: d.singleRoom || 0,
      double: d.doubleRoom || 0,
      promotion: d.promotion || '',
      display_order: d.display_order ?? 0,
      price: d.price || 0,
      discount: d.discount || 0,
      notes: d.notes || d.remarks || '',
      earlyCheckIn: !!d.earlyCheckIn,
      lateCheckOut: !!d.lateCheckOut,
      flightIn: d.flightIn || '',
      flightOut: d.flightOut || '',
      flightInfo: d.flightInfo || ''
    }, { emitEvent: false });

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
      }, { emitEvent: false });
    }

    // Important: Only fetch from API if we don't have the room types list yet
    this.patchRoomTypes(d);

    let hId = d.hotel_id;
    if (!hId && d.hotel) {
       const matched = this.masterData.hotels().find((h: any) => h.name === d.hotel);
       if (matched) hId = matched.id;
    }

    if (hId) {
      this.hotelForm.patchValue({ hotel: hId }, { emitEvent: false });
      const hotelObj = this.masterData.hotels().find(h => h.id == hId);
      if (hotelObj) {
        this.hotelSearchQuery.set(hotelObj.name);
      }
      this.updateHotelDetails(hId);
    }
  }

  private patchRoomTypes(d: any) {
    if (d.roomTypes && Array.isArray(d.roomTypes) && d.roomTypes.length > 0) {
      this.roomTypes.clear();
      d.roomTypes.forEach((rt: any) => {
        this.roomTypes.push(this.fb.group({
          roomType: [rt.roomType || rt.name || '', Validators.required],
          adults: [rt.adults || 0],
          children: [rt.children || 0],
          compAbf: [rt.compAbf || false],
          extraAdultBed: [rt.extraAdultBed || false],
          extraChildBed: [rt.extraChildBed || false],
          sharingBed: [rt.sharingBed || false]
        }));
      });
    } else if (d.roomType || d.name) {
      this.roomTypes.clear();
      this.roomTypes.push(this.fb.group({
        roomType: [d.roomType || d.name || '', Validators.required],
        adults: [d.adults || 0],
        children: [d.children || 0],
        compAbf: [d.compAbf || false],
        extraAdultBed: [d.extraAdultBed || false],
        extraChildBed: [d.extraChildBed || false],
        sharingBed: [d.sharingBed || false]
      }));
    }
  }

  updateHotelDetails(hotelId: string | number) {
    this.hotelApi.getHotel(hotelId).subscribe({
      next: (details: any) => {
        this.roomTypesList.set(details.roomTypes || []);
        this.promotionsList.set(details.promotions || []);
        
        // Sync search query with selected hotel name if missing
        const currentHotelId = this.hotelForm.get('hotel')?.value;
        if (currentHotelId == hotelId) {
          const hotelObj = this.masterData.hotels().find(h => h.id == hotelId);
          if (hotelObj && !this.hotelSearchQuery()) {
            this.hotelSearchQuery.set(hotelObj.name);
          }
        }
      },
      error: (err) => {
        console.error('Error fetching hotel details:', err);
      }
    });
  }

  selectHotel(hotel: any) {
    this.hotelForm.patchValue({ hotel: hotel.id });
    this.hotelSearchQuery.set(hotel.name);
    this.showHotelResults.set(false);
    this.updateHotelDetails(hotel.id);
  }

  clearHotelSearch() {
    this.hotelSearchQuery.set('');
    this.hotelForm.patchValue({ hotel: '' });
    this.showHotelResults.set(true);
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
    const markup = this.agentMarkup();
    if (!markup) {
      this.errorMessage.set('No markup configured for this agent. Please assign a markup group first.');
      return;
    }
    const nights = Number(this.hotelForm.get('nights')?.value) || 1;
    const roomTypes = this.roomTypesList();
    // หา room type ที่ถูกเลือกอยู่
    const selectedRoomTypeName = this.hotelForm.get('roomTypes')?.value?.[0]?.roomType;
    const roomType = roomTypes.find((rt: any) =>
      rt.name === selectedRoomTypeName || rt.room_type === selectedRoomTypeName
    );
    const basePerNight = roomType
      ? Number(roomType.room_price || roomType.price || 0)
      : 0;
    const ranges = markup.hotel_markup_percentages || [];
    const priceWithMarkup = this.markupCalc.applyHotelMarkup(basePerNight, ranges);
    const total = this.markupCalc.round(priceWithMarkup * nights);
    this.hotelForm.patchValue({ price: total });
    this.errorMessage.set(null);
  }

  errorMessage = signal<string | null>(null);

  onSave() {
    // ตรวจสอบว่าจำนวน Adults/Children รวมทุก room ไม่เกิน booking
    const totalAdults = this.roomTypes.controls.reduce(
      (sum, c) => sum + (Number((c as FormGroup).get('adults')?.value) || 0), 0
    );
    const totalChildren = this.roomTypes.controls.reduce(
      (sum, c) => sum + (Number((c as FormGroup).get('children')?.value) || 0), 0
    );
    const maxAdults = this.numberOfAdults();
    const maxChildren = this.numberOfChildren();

    if (maxAdults > 0 && totalAdults > maxAdults) {
      this.errorMessage.set(`Total adults across all rooms (${totalAdults}) cannot exceed booking adults (${maxAdults}).`);
      return;
    }
    if (maxChildren > 0 && totalChildren > maxChildren) {
      this.errorMessage.set(`Total children across all rooms (${totalChildren}) cannot exceed booking children (${maxChildren}).`);
      return;
    }

    if (this.hotelForm.valid) {
      this.errorMessage.set(null);
      const hotelId = this.hotelForm.get('hotel')?.value;
      const hotelObj = this.masterData.hotels().find(h => h.id == hotelId);
      const data = this.hotelForm.getRawValue();
      data.hotel_name = hotelObj ? hotelObj.name : '';
      data.hotel_id = hotelId;
      this.save.emit(data);
    } else {
      console.warn('Form is invalid. Errors:', this.getFormValidationErrors());
      this.errorMessage.set('Please fill in all required fields.');
      this.hotelForm.markAllAsTouched();
      this.roomTypes.controls.forEach(c => {
        (c as FormGroup).markAllAsTouched();
      });
      setTimeout(() => {
        const firstInvalidControl = document.querySelector('.ng-invalid');
        if (firstInvalidControl) {
          (firstInvalidControl as HTMLElement).focus();
        }
      }, 100);
    }
  }

  getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.hotelForm.controls).forEach(key => {
      const controlErrors = this.hotelForm.get(key)?.errors;
      if (controlErrors != null) {
        errors[key] = controlErrors;
      }
    });
    // Check Room Types FormArray
    this.roomTypes.controls.forEach((group, index) => {
      const groupErrors: any = {};
      Object.keys((group as FormGroup).controls).forEach(key => {
        const ctrlErrors = (group as FormGroup).get(key)?.errors;
        if (ctrlErrors != null) {
          groupErrors[key] = ctrlErrors;
        }
      });
      if (Object.keys(groupErrors).length > 0) {
        errors[`roomType_${index}`] = groupErrors;
      }
    });
    return errors;
  }
}
