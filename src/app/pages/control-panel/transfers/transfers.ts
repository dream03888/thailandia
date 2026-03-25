import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './transfers.html',
  styleUrl: './transfers.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransfersComponent {
  private translationService = inject(TranslationService);
  public t = this.translationService.translations;

  searchQuery = signal('');
  itemsPerPage = signal(25);

  transfersList = signal<any[]>([
    { id: 1, city: 'Rayong', type: 'TIN', supplier: 'VeraThailandia', departure: 'Airport Suvarnabhumi Bangkok', arrival: 'Pier Bang Phe Rayong', description: 'Airport BANGKOK - Pier Bang Phe RAYONG with driver' },
    { id: 2, city: 'Hat Yai', type: 'TIN', supplier: 'Fantasia Asia Travel Service', departure: 'Airport Hat Yai', arrival: 'Pier Pakbara Satun', description: 'Airport Hat Yai - Pakbara Pier Satun with driver' },
    { id: 3, city: 'Koh Phangan', type: 'TIN', supplier: 'Papaiteow Transportation Company', departure: 'Airport Koh Samui', arrival: 'Pier Thon Sala Koh Phangan', description: 'AIRPORT Koh Samui - PIER Koh Phangan' },
    { id: 4, city: 'Koh Tao', type: 'TIN', supplier: 'Papaiteow Transportation Company', departure: 'Airport Koh Samui', arrival: 'Pier Mae Haad Koh Tao', description: 'AIRPORT Koh Samui - PIER Mae Haad Koh Tao' },
    { id: 5, city: 'Phuket', type: 'TIN', supplier: 'Asia Sensation Travel', departure: 'Airport Phuket', arrival: 'Hotel Phuket', description: 'Airport PHUKET - Hotel PHUKET with driver' },
    { id: 6, city: 'Bangkok', type: 'TIN', supplier: 'VeraThailandia', departure: 'Airport Suvarnabhumi', arrival: 'Hotel Bangkok', description: 'Airport SUVARNABHUMI - Hotel BANGKOK with driver' }
  ]);

  filteredTransfers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.transfersList().filter((tr: any) => 
      tr.city.toLowerCase().includes(query) || 
      tr.supplier.toLowerCase().includes(query) ||
      tr.departure.toLowerCase().includes(query) ||
      tr.arrival.toLowerCase().includes(query) ||
      tr.description.toLowerCase().includes(query)
    );
  });

  totalItems = computed(() => this.filteredTransfers().length);

  deleteTransfer(id: number) {
    if (confirm('Are you sure you want to delete this transfer?')) {
      this.transfersList.update(list => list.filter(tr => tr.id !== id));
    }
  }
}
