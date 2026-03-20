import { Component, ChangeDetectionStrategy, signal, inject, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FlightModalComponent } from '../../core/components/modals/flight-modal/flight-modal';
import { TransferModalComponent } from '../../core/components/modals/transfer-modal/transfer-modal';
import { HotelModalComponent } from '../../core/components/modals/hotel-modal/hotel-modal';
import { ExcursionModalComponent } from '../../core/components/modals/excursion-modal/excursion-modal';
import { TourModalComponent } from '../../core/components/modals/tour-modal/tour-modal';
import { OtherModalComponent } from '../../core/components/modals/other-modal/other-modal';
import { TranslationService } from '../../core/services/translation.service';
import { QuotationService } from '../../core/services/quotation.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-quotation',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    FlightModalComponent,
    TransferModalComponent,
    HotelModalComponent,
    ExcursionModalComponent,
    TourModalComponent,
    OtherModalComponent
  ],
  templateUrl: './add-quotation.html',
  styleUrl: './add-quotation.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddQuotationComponent {
  public location = inject(Location);
  private translationService = inject(TranslationService);
  private quotationService = inject(QuotationService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  public t = this.translationService.translations;

  // State for services
  flights = signal<any[]>([]);
  transfers = signal<any[]>([]);
  hotels = signal<any[]>([]);
  excursions = signal<any[]>([]);
  tours = signal<any[]>([]);
  other = signal<any[]>([]);

  // Main Form
  quotationForm = this.fb.group({
    bookingDate: [new Date().toISOString().split('T')[0]],
    tripStartDate: [''],
    clientName: [''],
    mobileNumber: [''],
    emailId: [''],
    adults: [2],
    children: [0],
    bookingRef: [''],
    remark: [''],
    assistanceFee: [1000],
    includeFee: [true]
  });

  // Computed totals
  totalCost = computed(() => {
    const fCost = this.flights().reduce((sum, f) => sum + (Number(f.cost) || 0), 0);
    const tCost = this.transfers().reduce((sum, t) => sum + (Number(t.price) || 0), 0);
    const hCost = this.hotels().reduce((sum, h) => sum + (Number(h.price) || 0), 0);
    const eCost = this.excursions().reduce((sum, e) => sum + (Number(e.price) || 0), 0);
    const trCost = this.tours().reduce((sum, tr) => sum + (Number(tr.price) || 0), 0);
    const oCost = this.other().reduce((sum, o) => sum + (Number(o.totalPrice) || 0), 0);
    return fCost + tCost + hCost + eCost + trCost + oCost;
  });

  finalPrice = computed(() => {
    const total = this.totalCost();
    const fee = this.quotationForm.get('includeFee')?.value ? (this.quotationForm.get('assistanceFee')?.value || 0) : 0;
    return total + Number(fee);
  });
  tabs = [
    { id: 'flight', name: 'Flight', icon: 'fa-plane' },
    { id: 'transfers', name: 'Transfers', icon: 'fa-bus' },
    { id: 'hotels', name: 'Hotels', icon: 'fa-hotel' },
    { id: 'excursions', name: 'Excursions', icon: 'fa-binoculars' },
    { id: 'tours', name: 'Tours', icon: 'fa-flag' },
    { id: 'other', name: 'Other', icon: 'fa-plus' }
  ];

  activeTab = signal('flight');
  isFlightModalOpen = signal(false);
  isTransferModalOpen = signal(false);
  isHotelModalOpen = signal(false);
  isExcursionModalOpen = signal(false);
  isTourModalOpen = signal(false);
  isOtherModalOpen = signal(false);

  setActiveTab(tabId: string) {
    this.activeTab.set(tabId);
  }

  openFlightModal() {
    this.isFlightModalOpen.set(true);
  }

  closeFlightModal() {
    this.isFlightModalOpen.set(false);
  }

  saveFlight(data: any) {
    this.flights.update(items => [...items, data]);
    this.closeFlightModal();
  }

  openTransferModal() { this.isTransferModalOpen.set(true); }
  closeTransferModal() { this.isTransferModalOpen.set(false); }
  saveTransfer(data: any) { 
    this.transfers.update(items => [...items, data]);
    this.closeTransferModal(); 
  }

  openHotelModal() { this.isHotelModalOpen.set(true); }
  closeHotelModal() { this.isHotelModalOpen.set(false); }
  saveHotel(data: any) { 
    this.hotels.update(items => [...items, data]);
    this.closeHotelModal(); 
  }

  openExcursionModal() { this.isExcursionModalOpen.set(true); }
  closeExcursionModal() { this.isExcursionModalOpen.set(false); }
  saveExcursion(data: any) { 
    this.excursions.update(items => [...items, data]);
    this.closeExcursionModal(); 
  }

  openTourModal() { this.isTourModalOpen.set(true); }
  closeTourModal() { this.isTourModalOpen.set(false); }
  saveTour(data: any) { 
    this.tours.update(items => [...items, data]);
    this.closeTourModal(); 
  }

  openOtherModal() { this.isOtherModalOpen.set(true); }
  closeOtherModal() { this.isOtherModalOpen.set(false); }
  saveOther(data: any) { 
    this.other.update(items => [...items, data]);
    this.closeOtherModal(); 
  }

  removeFlight(index: number) { this.flights.update(items => items.filter((_, i) => i !== index)); }
  removeTransfer(index: number) { this.transfers.update(items => items.filter((_, i) => i !== index)); }
  removeHotel(index: number) { this.hotels.update(items => items.filter((_, i) => i !== index)); }
  removeExcursion(index: number) { this.excursions.update(items => items.filter((_, i) => i !== index)); }
  removeTour(index: number) { this.tours.update(items => items.filter((_, i) => i !== index)); }
  removeOther(index: number) { this.other.update(items => items.filter((_, i) => i !== index)); }

  saveQuotation() {
    const formValue: any = this.quotationForm.value;
    
    const quotationData: any = {
      ref: this.quotationService.generateRef(),
      clientName: formValue.clientName || 'N/A',
      bookingDate: formValue.bookingDate || '',
      tripStartDate: formValue.tripStartDate || '',
      pax: (formValue.adults || 0) + (formValue.children || 0),
      telephone: formValue.mobileNumber || '',
      email: formValue.emailId || '',
      bookingRef: formValue.bookingRef || '',
      status: 'Pending',
      totalPrice: this.totalCost(),
      finalPrice: this.finalPrice(),
      discount: 0,
      assistanceFee: Number(formValue.assistanceFee) || 0,
      remark: formValue.remark || '',
      services: {
        flights: this.flights(),
        transfers: this.transfers(),
        hotels: this.hotels(),
        excursions: this.excursions(),
        tours: this.tours(),
        other: this.other()
      }
    };

    this.quotationService.addQuotation(quotationData);
    this.router.navigate(['/quotation']);
  }
}
