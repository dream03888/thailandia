import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FlightModalComponent } from '../../core/components/modals/flight-modal/flight-modal';
import { TransferModalComponent } from '../../core/components/modals/transfer-modal/transfer-modal';
import { HotelModalComponent } from '../../core/components/modals/hotel-modal/hotel-modal';
import { ExcursionModalComponent } from '../../core/components/modals/excursion-modal/excursion-modal';
import { TourModalComponent } from '../../core/components/modals/tour-modal/tour-modal';
import { OtherModalComponent } from '../../core/components/modals/other-modal/other-modal';
import { TranslationService } from '../../core/services/translation.service';

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
  public t = this.translationService.translations;
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
    // Save logic here
    this.closeFlightModal();
  }

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
}
