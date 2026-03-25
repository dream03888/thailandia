import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormsModule } from '@angular/forms';
import { TranslationService } from '../../../core/services/translation.service';
import { AddTourPriceModalComponent } from '../../../core/components/modals/add-tour-price-modal/add-tour-price-modal';

interface ServiceItem {
  id: number;
  city: string;
  fromTime: string;
  toTime: string;
  itemId: string; // hotelId, excursionId, or transferId
  roomType?: string; // only for hotels
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
  private translationService = inject(TranslationService);
  t = this.translationService.translations;

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
  itinerary = signal<ItineraryDay[]>([]);
  prices = signal<any[]>([]);
  
  // Computed duration
  duration = computed(() => this.itinerary().length);

  // Modal state
  isPriceModalOpen = signal(false);

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
        fromTime: '',
        toTime: '',
        itemId: ''
      };
      
      if (type === 'hotels') newService.roomType = '';
      
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
      console.log('Saving Tour:', {
        ...this.tourForm.value,
        duration: this.duration(),
        itinerary: this.itinerary(),
        prices: this.prices()
      });
      this.goBack();
    } else {
      this.tourForm.markAllAsTouched();
      alert('Please fill in all required fields.');
    }
  }
}
