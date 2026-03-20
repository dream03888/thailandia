import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FlightModalComponent } from '../../core/components/modals/flight-modal/flight-modal';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-add-quotation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FlightModalComponent],
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
}
