import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';

interface Tour {
  startCity: string;
  name: string;
  duration: number;
  validDays: string;
  category: string;
  description: string;
}

@Component({
  selector: 'app-tours',
  templateUrl: './tours.html',
  styleUrls: ['./tours.css'],
  imports: [CommonModule, RouterModule]
})
export class ToursComponent {
  private translationService = inject(TranslationService);
  t = this.translationService.translations;

  // Mock data based on Image 1
  allTours = signal<Tour[]>([
    { startCity: 'Bangkok', name: 'Gems Of Nan 2025.2026 SIC With ISG', duration: 4, validDays: 'Wed', category: 'Standard', description: 'Departure every WEDNESDAY with ISG' },
    { startCity: 'Chiang Rai', name: 'Legends Of North 2025.2026 STA SIC With ISG', duration: 3, validDays: 'Mon, Tue, Wed, Thu, Fri, Sat, Sun', category: 'Standard', description: 'Departure SIC every MONDAY with ISG' },
    { startCity: 'Chiang Rai', name: 'Golden Triangle 2025.2026 SUP SIC With ISG', duration: 3, validDays: 'Mon, Tue, Wed, Thu, Fri, Sat, Sun', category: 'Superior', description: 'Departure SIC every SATURDAY with ISG' },
    { startCity: 'Chiang Rai', name: 'Legends Of North 2025.2026 SUP SIC With ISG', duration: 3, validDays: 'Mon', category: 'Superior', description: 'Departure SIC every MONDAY with ISG' },
    { startCity: 'Bangkok', name: 'Charm Of North 2025.2026 STA SIC With ISG', duration: 4, validDays: 'All Days', category: 'Standard', description: 'Departure every THURSDAY with ISG' },
    { startCity: 'Bangkok', name: 'History & Nature 2025 SIC With ISG', duration: 2, validDays: 'All Days', category: 'Superior', description: 'Departure SIC every TUESDAY with ISG' },
    { startCity: 'Bangkok', name: 'The Old Capitals 2025/2026 STA SIC With ISG', duration: 3, validDays: 'All Days', category: 'Standard', description: 'Departure every THURSDAY with ISG' },
    { startCity: 'Bangkok', name: 'The Old Capitals 2025/2026 SUP SIC With ISG', duration: 3, validDays: 'All Days', category: 'Superior', description: 'Departure every THURSDAY with ISG' },
    { startCity: 'Chiang Rai', name: 'North Express 2025.2026 SUP SIC With ISG', duration: 2, validDays: 'All Days', category: 'Superior', description: 'Departure SIC every FRIDAY with ISG' },
    { startCity: 'Chiang Mai', name: 'Discovery Thailand 2025/2026 SUP SIC With ISG', duration: 4, validDays: 'All Days', category: 'Superior', description: 'Departure SIC every SUNDAY with ISG' },
    { startCity: 'Chiang Rai', name: 'North Express 2025.2026 STA SIC With ISG', duration: 2, validDays: 'Mon, Tue, Wed, Thu, Fri, Sat, Sun', category: 'Standard', description: 'Departure SIC every FRIDAY with ISG' },
    { startCity: 'Bangkok', name: 'Beauty Of Siam 2025.2026 STA SIC With ISG', duration: 5, validDays: 'Tue', category: 'Standard', description: 'Departure SIC every TUESDAY with ISG' },
    { startCity: 'Chiang Rai', name: 'Golden Triangle 2025.2026 STA SIC With ISG', duration: 3, validDays: 'Mon, Tue, Wed, Thu, Fri, Sat, Sun', category: 'Standard', description: 'Departure SIC every SATURDAY with ISG' }
  ]);

  searchQuery = signal('');

  filteredTours = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.allTours();
    return this.allTours().filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.startCity.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );
  });

  filterTours(val: string) {
    this.searchQuery.set(val);
  }

  deleteTour(name: string) {
    if (confirm('Are you sure you want to delete this tour?')) {
      this.allTours.update(prev => prev.filter(t => t.name !== name));
    }
  }
}
