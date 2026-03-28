import { Component, ChangeDetectionStrategy, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FlightModalComponent } from '../../core/components/modals/flight-modal/flight-modal';
import { TransferModalComponent } from '../../core/components/modals/transfer-modal/transfer-modal';
import { HotelModalComponent } from '../../core/components/modals/hotel-modal/hotel-modal';
import { ExcursionModalComponent } from '../../core/components/modals/excursion-modal/excursion-modal';
import { TourModalComponent } from '../../core/components/modals/tour-modal/tour-modal';
import { OtherModalComponent } from '../../core/components/modals/other-modal/other-modal';
import { TranslationService } from '../../core/services/translation.service';
import { TripApiService } from '../../core/services/api/trip-api.service';
import { MasterDataService } from '../../core/services/master-data.service';
import { HotelApiService } from '../../core/services/api/hotel-api.service';
import { AgentApiService } from '../../core/services/api/agent-api.service';
import { ExcursionApiService } from '../../core/services/api/excursion-api.service';
import { TourApiService } from '../../core/services/api/tour-api.service';
import { TransferApiService } from '../../core/services/api/transfer-api.service';
import { Router, ActivatedRoute } from '@angular/router';

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
export class AddQuotationComponent implements OnInit {
  public location = inject(Location);
  private translationService = inject(TranslationService);
  private tripApiService = inject(TripApiService);
  private hotelApiService = inject(HotelApiService);
  private agentApiService = inject(AgentApiService);
  private excursionApiService = inject(ExcursionApiService);
  private tourApiService = inject(TourApiService);
  private transferApiService = inject(TransferApiService);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public masterData = inject(MasterDataService);

  public t = this.translationService.translations;
  editId = signal<string | number | null>(null);

  // Master data for select boxes
  availableAgents = signal<any[]>([]);
  availableHotels = signal<any[]>([]);
  availableExcursions = signal<any[]>([]);
  availableTours = signal<any[]>([]);
  availableTransfers = signal<any[]>([]);

  // State for trip services
  flights = signal<any[]>([]);
  transfers = signal<any[]>([]);
  hotels = signal<any[]>([]);
  excursions = signal<any[]>([]);
  tours = signal<any[]>([]);
  other = signal<any[]>([]);

  // Main Form
  quotationForm = this.fb.group({
    agentId: [''],
    bookingDate: [new Date().toISOString().split('T')[0]],
    tripStartDate: [''],
    clientName: [''],
    mobileNumber: [''],
    emailId: [''],
    adults: [0],
    children: [0],
    bookingRef: [''],
    status: ['Pending'],
    remark: [''],
    assistanceFee: [1000],
    includeFee: [true]
  });

  isBooking = computed(() => this.router.url.includes('booking'));
  pageTitle = computed(() => this.isBooking() ? (this.t()['booking.addBtn'] || 'Add Booking') : (this.t()['quote.addBtn'] || 'Add Quotation'));
  saveBtnText = computed(() => this.isBooking() ? (this.t()['booking.table.save'] || 'Save Booking') : (this.t()['form.saveQuotation'] || 'Save Quotation'));

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

  ngOnInit() {
    this.masterData.refresh();
    this.loadMasterData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editId.set(id);
      this.tripApiService.getTrip(id).subscribe(q => {
        if (q) {
          this.quotationForm.patchValue({
            agentId: q.agent_id ? q.agent_id.toString() : '',
            bookingDate: q.created_at ? q.created_at.split('T')[0] : '',
            tripStartDate: q.trip_start_date ? q.trip_start_date.split('T')[0] : '',
            clientName: q.client_name,
            mobileNumber: q.client_phone,
            bookingRef: q.booking_reference,
            status: q.approved ? 'Approved' : (q.declined ? 'Declined' : 'Pending'),
            remark: q.remarks,
            assistanceFee: Number(q.final_amount) - Number(q.total_amount),
            adults: q.number_of_adults,
            children: q.number_of_kids,
            includeFee: true
          });

          this.flights.set(q.flights?.map((f: any) => ({
            date: f.from_date ? f.from_date.split('T')[0] : '',
            number: f.flight_number,
            inOut: f.in_or_out,
            route: f.route,
            cost: f.price,
            remarks: f.remarks
          })) || []);

          this.hotels.set(q.hotels?.map((h: any) => ({
            checkIn: h.from_date ? h.from_date.split('T')[0] : '',
            checkOut: h.to_date ? h.to_date.split('T')[0] : '',
            city: h.city,
            hotel: h.hotel_name,
            roomType: h.room_type,
            nights: h.nights,
            singleRoom: h.single_price,
            doubleRoom: h.double_price,
            price: Number(h.single_price) + Number(h.double_price)
          })) || []);

          this.transfers.set(q.transfers?.map((t: any) => ({
            date: t.from_date ? t.from_date.split('T')[0] : '',
            city: t.city,
            description: t.description,
            tot: t.tot,
            from: t.from_location,
            to: t.to_location,
            price: t.price,
            remarks: t.remarks
          })) || []);

          this.excursions.set(q.excursions?.map((e: any) => ({
            date: e.from_date ? e.from_date.split('T')[0] : '',
            city: e.city,
            name: e.excursion_id, // Map ID or Name?
            price: e.price,
            remarks: e.remarks
          })) || []);

        }
      });
    }
  }

  loadMasterData() {
    this.agentApiService.listAgents().subscribe(data => this.availableAgents.set(data));
    this.hotelApiService.listHotels().subscribe(data => this.availableHotels.set(data));
    this.excursionApiService.listExcursions().subscribe(data => this.availableExcursions.set(data));
    this.tourApiService.listTours().subscribe(data => this.availableTours.set(data));
    this.transferApiService.listTransfers().subscribe(data => this.availableTransfers.set(data));
  }

  openFlightModal() { this.isFlightModalOpen.set(true); }
  closeFlightModal() { this.isFlightModalOpen.set(false); }
  saveFlight(data: any) {
    const normalized = {
      date: data.dateOfTravel,
      flight: data.flight,
      number: data.number,
      inOut: data.flightInOut,
      route: data.route,
      edt: data.departureTime,
      eat: data.arrivalTime,
      issued: data.issuedBy,
      cost: data.cost,
      remarks: data.remarks
    };
    this.flights.update(items => [...items, normalized]);
    this.closeFlightModal();
  }

  openTransferModal() { this.isTransferModalOpen.set(true); }
  closeTransferModal() { this.isTransferModalOpen.set(false); }
  saveTransfer(data: any) {
    const normalized = {
      date: data.date,
      city: data.city,
      description: data.transfer_name, // Use name for display
      transfer_id: data.transfer_id,
      tot: data.tot,
      from: data.from,
      to: data.to,
      pickup: data.pickupTime,
      remarks: data.remarks,
      price: data.price
    };
    this.transfers.update(items => [...items, normalized]);
    this.closeTransferModal();
  }

  openHotelModal() { this.isHotelModalOpen.set(true); }
  closeHotelModal() { this.isHotelModalOpen.set(false); }
  saveHotel(data: any) {
    const normalized = {
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      city: data.city,
      hotel: data.hotel_name, // Use name for display
      hotel_id: data.hotel_id,
      roomType: data.roomTypes && data.roomTypes.length > 0 ? data.roomTypes[0].roomType : '',
      nights: data.nights,
      singleRoom: data.single,
      doubleRoom: data.double,
      promotion: data.promotion,
      price: data.price
    };
    this.hotels.update(items => [...items, normalized]);
    this.closeHotelModal();
  }

  openExcursionModal() { this.isExcursionModalOpen.set(true); }
  closeExcursionModal() { this.isExcursionModalOpen.set(false); }
  saveExcursion(data: any) {
    const normalized = {
      date: data.date,
      city: data.city,
      name: data.excursion_name, // Use name for display
      excursion_id: data.excursion_id,
      pickup: data.pickupTime,
      hotel: data.hotel,
      remarks: data.remarks,
      toe: data.typeOfExcursion,
      price: data.price
    };
    this.excursions.update(items => [...items, normalized]);
    this.closeExcursionModal();
  }

  openTourModal() { this.isTourModalOpen.set(true); }
  closeTourModal() { this.isTourModalOpen.set(false); }
  saveTour(data: any) {
    const normalized = {
      city: data.startCity,
      name: data.tour_name, // Use name for display
      tour_id: data.tour_id,
      tot: data.tot,
      route: data.route,
      pax: data.pax,
      remarks: data.remarks,
      price: data.price
    };
    this.tours.update(items => [...items, normalized]);
    this.closeTourModal();
  }

  openOtherModal() { this.isOtherModalOpen.set(true); }
  closeOtherModal() { this.isOtherModalOpen.set(false); }
  saveOther(data: any) { this.other.update(items => [...items, data]); this.closeOtherModal(); }

  removeFlight(index: number) { this.flights.update(items => items.filter((_, i) => i !== index)); }
  removeTransfer(index: number) { this.transfers.update(items => items.filter((_, i) => i !== index)); }
  removeHotel(index: number) { this.hotels.update(items => items.filter((_, i) => i !== index)); }
  removeExcursion(index: number) { this.excursions.update(items => items.filter((_, i) => i !== index)); }
  removeTour(index: number) { this.tours.update(items => items.filter((_, i) => i !== index)); }
  removeOther(index: number) { this.other.update(items => items.filter((_, i) => i !== index)); }

  saveQuotation() {
    if (this.quotationForm.invalid) {
      this.quotationForm.markAllAsTouched();
      alert('Please fill all required fields (marked with *). Check Trip Start Date and Client Name.');
      return;
    }
    const formValue: any = this.quotationForm.value;
    
    const quotationData: any = {
      agent_id: formValue.agentId ? Number(formValue.agentId) : null,
      client_name: formValue.clientName || 'N/A',
      client_phone: formValue.mobileNumber || '',
      number_of_adults: Number(formValue.adults) || 0,
      trip_start_date: formValue.tripStartDate || null,
      total_amount: this.totalCost(),
      final_amount: this.finalPrice(),
      remarks: formValue.remark || '',
      status: this.isBooking() ? 'Approved' : (formValue.status || 'Pending'),
      hotels: this.hotels(),
      transfers: this.transfers(),
      excursions: this.excursions(),
      tours: this.tours(),
      flights: this.flights(),
      other: this.other()
    };

    if (this.editId()) {
      this.tripApiService.updateTrip(this.editId()!, quotationData).subscribe(() => this.goBack());
    } else {
      this.tripApiService.createTrip(quotationData).subscribe({
        next: () => {
          if (this.isBooking()) {
            this.router.navigate(['/control-panel/bookings']);
          } else {
            this.router.navigate(['/quotation']);
          }
        },
        error: (err: any) => {
          console.error('Error creating trip:', err);
          alert('Failed to save trip');
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }
}
