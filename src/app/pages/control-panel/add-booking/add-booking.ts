import { Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { TranslationService } from '../../../core/services/translation.service';
import { FlightModalComponent } from '../../../core/components/modals/flight-modal/flight-modal';
import { TransferModalComponent } from '../../../core/components/modals/transfer-modal/transfer-modal';
import { HotelModalComponent } from '../../../core/components/modals/hotel-modal/hotel-modal';
import { ExcursionModalComponent } from '../../../core/components/modals/excursion-modal/excursion-modal';
import { TourModalComponent } from '../../../core/components/modals/tour-modal/tour-modal';
import { OtherModalComponent } from '../../../core/components/modals/other-modal/other-modal';

@Component({
  selector: 'app-add-booking',
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
  templateUrl: './add-booking.html',
  styleUrl: './add-booking.css'
})
export class AddBookingComponent {
  private fb = inject(FormBuilder);
  private bookingService = inject(BookingService);
  private router = inject(Router);
  public location = inject(Location);
  public translationService = inject(TranslationService);
  public t = this.translationService.translations;

  bookingForm = this.fb.nonNullable.group({
    agent: ['', Validators.required],
    bookingDate: ['', Validators.required],
    tripStartDate: ['', Validators.required],
    clientName: ['', Validators.required],
    telephone: ['', Validators.required],
    email: [''],
    paxAdults: [0],
    paxChildren: [0],
    bookingRef: [''],
    invoiceNumber: [''],
    remark: [''],
    totalPrice: [0],
    finalCost: [0],
    discount: [0]
  });
  tabs = [
    { id: 'flights', name: 'Flights', icon: 'fa-plane', colorClass: 'tab-blue' },
    { id: 'transfers', name: 'Transfers', icon: 'fa-bus', colorClass: 'tab-teal' },
    { id: 'hotels', name: 'Hotels', icon: 'fa-hotel', colorClass: 'tab-grey' },
    { id: 'excursions', name: 'Excursions', icon: 'fa-binoculars', colorClass: 'tab-yellow' },
    { id: 'tours', name: 'Tours', icon: 'fa-sign-hanging', colorClass: 'tab-green' },
    { id: 'other', name: 'Other Charges', icon: 'fa-plus-circle', colorClass: 'tab-dark-grey' }
  ];

  activeTab = signal('flights');
  
  isFlightModalOpen = signal(false);
  isTransferModalOpen = signal(false);
  isHotelModalOpen = signal(false);
  isExcursionModalOpen = signal(false);
  isTourModalOpen = signal(false);
  isOtherModalOpen = signal(false);

  setActiveTab(tabId: string) {
    this.activeTab.set(tabId);
  }

  // Modal controls
  openFlightModal() { this.isFlightModalOpen.set(true); }
  closeFlightModal() { this.isFlightModalOpen.set(false); }
  saveFlight(data: any) { this.closeFlightModal(); }

  openTransferModal() { this.isTransferModalOpen.set(true); }
  closeTransferModal() { this.isTransferModalOpen.set(false); }
  saveTransfer(data: any) { this.closeTransferModal(); }

  openHotelModal() { this.isHotelModalOpen.set(true); }
  closeHotelModal() { this.isHotelModalOpen.set(false); }
  saveHotel(data: any) { this.closeHotelModal(); }

  openExcursionModal() { this.isExcursionModalOpen.set(true); }
  closeExcursionModal() { this.isExcursionModalOpen.set(false); }
  saveExcursion(data: any) { this.closeExcursionModal(); }

  openTourModal() { this.isTourModalOpen.set(true); }
  closeTourModal() { this.isTourModalOpen.set(false); }
  saveTour(data: any) { this.closeTourModal(); }

  openOtherModal() { this.isOtherModalOpen.set(true); }
  closeOtherModal() { this.isOtherModalOpen.set(false); }
  saveOther(data: any) { this.closeOtherModal(); }

  saveBooking() {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const val = this.bookingForm.value;
    const paxAdults = val.paxAdults || 0;
    const paxChildren = val.paxChildren || 0;
    const totalPax = Number(paxAdults) + Number(paxChildren);

    const generateId = Math.floor(1000 + Math.random() * 9000); // Fake ID generator

    const newBooking = {
      agent: val.agent || '',
      quotationRef: '-',
      clientName: val.clientName || '',
      bookingDate: val.bookingDate || '',
      tripStartDate: val.tripStartDate || '',
      pax: totalPax,
      telephone: val.telephone || '',
      bookingRef: val.bookingRef || `B2026NEW${generateId}`,
      status: 'Pending',
      finalCost: val.finalCost || 0
    };

    this.bookingService.addBooking(newBooking);
    this.router.navigate(['/control-panel/bookings']);
  }
}

