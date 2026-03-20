import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BookingService } from '../../../core/services/booking.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-add-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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

  activeTab = 'flights';

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

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

