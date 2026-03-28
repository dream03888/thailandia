import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { TourApiService } from '../../../core/services/api/tour-api.service';

@Component({
  selector: 'app-tours',
  templateUrl: './tours.html',
  styleUrls: ['./tours.css'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ToursComponent implements OnInit {
  private translationService = inject(TranslationService);
  private tourApiService = inject(TourApiService);
  t = this.translationService.translations;

  allTours = signal<any[]>([]);

  searchQuery = signal('');

  ngOnInit() {
    this.loadTours();
  }

  loadTours() {
    this.tourApiService.listTours().subscribe(data => {
      this.allTours.set(data);
    });
  }

  filteredTours = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.allTours();
    return this.allTours().filter(t => 
      (t.name && t.name.toLowerCase().includes(query)) || 
      (t.startCity && t.startCity.toLowerCase().includes(query)) ||
      (t.description && t.description.toLowerCase().includes(query))
    );
  });

  filterTours(val: string) {
    this.searchQuery.set(val);
  }

  deleteTour(id: string | number) {
    if (confirm('Are you sure you want to delete this tour?')) {
      this.tourApiService.deleteTour(id).subscribe(() => {
        this.loadTours();
      });
    }
  }
}
