import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './hotels.html',
  styleUrl: './hotels.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelsComponent {
  private translationService = inject(TranslationService);
  public t = this.translationService.translations;

  searchQuery = signal('');
  itemsPerPage = signal(25);

  hotelsList = signal<any[]>([
    { id: 1, name: 'Centara - Ayutthaya', city: 'Ayutthaya' },
    { id: 2, name: 'Classic Kameo - Ayutthaya', city: 'Ayutthaya' },
    { id: 3, name: '137 Pillars Suites & Residences Bangkok', city: 'Bangkok' },
    { id: 4, name: '56 Surawong Hotel Bangkok', city: 'Bangkok' },
    { id: 5, name: 'Akara Hotel Bangkok', city: 'Bangkok' },
    { id: 6, name: 'Aloft Bangkok-Sukhumvit 11', city: 'Bangkok' },
    { id: 7, name: 'Amara Bangkok', city: 'Bangkok' }
  ]);

  filteredHotels = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.hotelsList().filter((h: any) => 
      h.name.toLowerCase().includes(query) || 
      h.city.toLowerCase().includes(query)
    );
  });

  totalItems = computed(() => this.filteredHotels().length);

  deleteHotel(id: number) {
    if (confirm('Are you sure you want to delete this hotel?')) {
      this.hotelsList.update(list => list.filter(h => h.id !== id));
    }
  }
}
