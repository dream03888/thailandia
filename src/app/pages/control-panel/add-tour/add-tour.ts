import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { TranslationService } from '../../../core/services/translation.service';
import { HotelApiService } from '../../../core/services/api/hotel-api.service';
import { ExcursionApiService } from '../../../core/services/api/excursion-api.service';
import { TransferApiService } from '../../../core/services/api/transfer-api.service';
import { TourApiService } from '../../../core/services/api/tour-api.service';
import { AddTourPriceModalComponent } from '../../../core/components/modals/add-tour-price-modal/add-tour-price-modal';

interface ServiceItem {
  id: number;
  city: string;
  from_time: string;
  to_time: string;
  item_id: string; // hotelId, excursionId, or transferId
  room_type?: string; // only for hotels
}

interface ItineraryDay {
  dayNumber: number;
  description: string;
  hotels: ServiceItem[];
  excursions: ServiceItem[];
  transfers: ServiceItem[];
}

@Component({
  selector: 'app-add-tour',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, AddTourPriceModalComponent],
  templateUrl: './add-tour.html',
  styleUrls: ['./add-tour.css']
})
export class AddTourComponent {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private translationService = inject(TranslationService);
  private hotelApiService = inject(HotelApiService);
  private excursionApiService = inject(ExcursionApiService);
  private transferApiService = inject(TransferApiService);
  private tourApiService = inject(TourApiService);
  t = this.translationService.translations;

  // Edit mode
  public editTourId = signal<number | null>(null);
  public isEditMode = computed(() => this.editTourId() !== null);

  tourForm = this.fb.group({
    name: ['', Validators.required],
    country: ['Thailand', Validators.required],
    startCity: ['', Validators.required],
    category: ['', Validators.required],
    departureType: ['', Validators.required],
    description: ['', Validators.required],
    route: ['', Validators.required],
    validDays: this.fb.group({
      mon: [true], tue: [true], wed: [true], thu: [false], fri: [false], sat: [false], sun: [false]
    })
  });

  // Dynamic state using signals
  public itinerary = signal<ItineraryDay[]>([]);
  public prices = signal<any[]>([]);

  // Lists from Database
  public hotelsList = signal<any[]>([]);
  public excursionsList = signal<any[]>([]);
  public transfersList = signal<any[]>([]);
  public hotelRoomsMap = signal<Record<string, any[]>>({});
  
  // Computed duration
  duration = computed(() => this.itinerary().length);

  // Modal state
  isPriceModalOpen = signal(false);

  ngOnInit() {
    this.loadDatabaseData();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editTourId.set(Number(id));
      this.loadTourForEdit(Number(id));
    }
  }

  loadTourForEdit(id: number) {
    this.tourApiService.getTour(id).subscribe((tour: any) => {
      // Parse valid_days if it came back as a JSON string
      let validDays = { mon: true, tue: true, wed: true, thu: false, fri: false, sat: false, sun: false };
      if (tour.valid_days) {
        try {
          validDays = typeof tour.valid_days === 'string' ? JSON.parse(tour.valid_days) : tour.valid_days;
        } catch { /* keep defaults */ }
      }

      // Patch main form fields
      this.tourForm.patchValue({
        name: tour.name || '',
        country: tour.country || 'Thailand',
        startCity: tour.city || '',
        category: tour.category || '',
        departureType: tour.departures || '',
        description: tour.description || '',
        route: tour.route || '',
        validDays
      });

      // Patch itinerary
      if (tour.itinerary && Array.isArray(tour.itinerary)) {
        const days: ItineraryDay[] = tour.itinerary.map((day: any) => ({
          dayNumber: day.day,
          description: day.itinerary || '',
          hotels: (day.hotels || []).map((s: any) => ({
            id: s.id || Date.now(),
            city: s.city || '',
            from_time: s.from_time || '',
            to_time: s.to_time || '',
            item_id: s.service_id ? String(s.service_id) : (s.service_name ? String(s.service_name) : ''),
            room_type: s.room_type || ''
          })),
          excursions: (day.excursions || []).map((s: any) => ({
            id: s.id || Date.now(),
            city: s.city || '',
            from_time: s.from_time || '',
            to_time: s.to_time || '',
            item_id: s.service_id ? String(s.service_id) : (s.service_name ? String(s.service_name) : '')
          })),
          transfers: (day.transfers || []).map((s: any) => ({
            id: s.id || Date.now(),
            city: s.city || '',
            from_time: s.from_time || '',
            to_time: s.to_time || '',
            item_id: s.service_id ? String(s.service_id) : (s.service_name ? String(s.service_name) : '')
          }))
        }));
        this.itinerary.set(days);
      }

      // Patch prices
      if (tour.pricing && Array.isArray(tour.pricing)) {
        const prices = tour.pricing.map((p: any) => ({
          startDate: p.start_date,
          endDate: p.end_date,
          singlePrice: p.single_room_price,
          doublePrice: p.double_room_price,
          triplePrice: p.triple_room_price
        }));
        this.prices.set(prices);
      }
    });
  }

  loadDatabaseData() {
    this.hotelApiService.listHotels({ limit: 1000 }).subscribe(res => this.hotelsList.set(res.data));
    this.excursionApiService.listExcursions({ limit: 1000 }).subscribe(res => this.excursionsList.set(res.data));
    this.transferApiService.listTransfers({ limit: 1000 }).subscribe(res => this.transfersList.set(res.data));
  }

  // Computed unique cities from all services
  public allCities = computed(() => {
    const cities = new Set<string>();
    this.hotelsList().forEach(h => { if (h.city) cities.add(h.city); });
    this.excursionsList().forEach(e => { if (e.city) cities.add(e.city); });
    this.transfersList().forEach(t => { if (t.city) cities.add(t.city); });
    return Array.from(cities).sort();
  });

  getFilteredHotels(city: string) {
    if (!city) return this.hotelsList();
    return this.hotelsList().filter(h => h.city === city);
  }

  getFilteredExcursions(city: string) {
    if (!city) return this.excursionsList();
    return this.excursionsList().filter(e => e.city === city);
  }

  getFilteredTransfers(city: string) {
    if (!city) return this.transfersList();
    return this.transfersList().filter(t => t.city === city);
  }

  onHotelChange(hotel: ServiceItem) {
    if (!hotel.item_id) return;
    this.hotelApiService.getHotel(hotel.item_id).subscribe(data => {
      if (data && data.roomTypes) {
        this.hotelRoomsMap.update(prev => ({
          ...prev,
          [hotel.item_id]: data.roomTypes
        }));
      }
    });
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.tourForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  goBack() {
    this.location.back();
  }

  toggleDay(dayKey: string) {
    const group = this.tourForm.get('validDays') as any;
    group.get(dayKey).setValue(!group.get(dayKey).value);
  }

  addDay() {
    this.itinerary.update(current => [
      ...current,
      {
        dayNumber: current.length + 1,
        description: '',
        hotels: [],
        excursions: [],
        transfers: []
      }
    ]);
  }

  removeDay(index: number) {
    this.itinerary.update(current => {
      const updated = current.filter((_, i) => i !== index);
      // Re-number days
      return updated.map((day, i) => ({ ...day, dayNumber: i + 1 }));
    });
  }

  addService(dayIndex: number, type: 'hotels' | 'excursions' | 'transfers') {
    this.itinerary.update(current => {
      const updated = [...current];
      const day = { ...updated[dayIndex] };
      const services = [...day[type]];
      
      const newService: ServiceItem = {
        id: Date.now(),
        city: '',
        from_time: '',
        to_time: '',
        item_id: ''
      };
      
      if (type === 'hotels') newService.room_type = '';
      
      services.push(newService);
      day[type] = services as any;
      updated[dayIndex] = day;
      return updated;
    });
  }

  removeService(dayIndex: number, type: 'hotels' | 'excursions' | 'transfers', serviceId: number) {
    this.itinerary.update(current => {
      const updated = [...current];
      const day = { ...updated[dayIndex] };
      day[type] = day[type].filter(s => s.id !== serviceId) as any;
      updated[dayIndex] = day;
      return updated;
    });
  }

  openPriceModal() {
    this.isPriceModalOpen.set(true);
  }

  savePrice(priceData: any) {
    this.prices.update(prev => [...prev, priceData]);
  }

  deletePrice(index: number) {
    this.prices.update(prev => prev.filter((_, i) => i !== index));
  }

  saveTour() {
    if (this.tourForm.valid) {
      const formValue = this.tourForm.value as any;
      
      const tourData = {
        name: formValue.name,
        code: formValue.name.substring(0, 3).toUpperCase() + Math.floor(Math.random() * 1000),
        category: formValue.category,
        description: formValue.description,
        duration: this.duration(),
        route: formValue.route,
        departures: formValue.departureType,
        city: formValue.startCity,
        valid_days: formValue.validDays,
        itinerary: this.itinerary(),
        pricing: this.prices().map(p => ({
          start_date: p.startDate,
          end_date: p.endDate,
          single_room_price: p.singlePrice,
          double_room_price: p.doublePrice,
          triple_room_price: p.triplePrice,
          currency_id: 4
        }))
      };

      const id = this.editTourId();
      const request$ = id
        ? this.tourApiService.updateTour(id, tourData)
        : this.tourApiService.createTour(tourData);

      request$.subscribe({
        next: () => {
          alert(id ? 'Tour updated successfully!' : 'Tour saved successfully!');
          this.goBack();
        },
        error: (err) => {
          console.error('Error saving tour:', err);
          alert('Error saving tour: ' + (err.error?.message || err.message));
        }
      });
    } else {
      this.tourForm.markAllAsTouched();
      alert('Please fill in all required fields.');
    }
  }
}
