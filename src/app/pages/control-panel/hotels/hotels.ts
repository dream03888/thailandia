import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { HotelApiService } from '../../../core/services/api/hotel-api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './hotels.html',
  styleUrl: './hotels.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelsComponent implements OnInit {
  private translationService = inject(TranslationService);
  private hotelApiService = inject(HotelApiService);
  public t = this.translationService.translations;

  searchQuery = signal('');
  itemsPerPage = signal(25);

  hotelsList = signal<any[]>([]);

  ngOnInit() {
    this.loadHotels();
  }

  loadHotels() {
    this.hotelApiService.listHotels().subscribe(hotels => {
      this.hotelsList.set(hotels);
    });
  }

  filteredHotels = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.hotelsList().filter((h: any) => 
      h.name.toLowerCase().includes(query) || 
      h.city.toLowerCase().includes(query)
    );
  });

  totalItems = computed(() => this.filteredHotels().length);

  deleteHotel(id: number | string) {
    if (confirm('Are you sure you want to delete this hotel?')) {
      this.hotelApiService.deleteHotel(id).subscribe(() => {
        this.loadHotels();
      });
    }
  }
}
