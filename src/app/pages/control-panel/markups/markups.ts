import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-markups',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './markups.html',
  styleUrl: './markups.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkupsComponent {
  private translationService = inject(TranslationService);
  public t = this.translationService.translations;

  searchQuery = signal('');
  itemsPerPage = signal(25);

  markupsList = signal<any[]>([
    { id: 1, groupName: 'Local Agent', hotel: '%', excursion: '400 THB', tour: '2500 THB', transfer: '200 THB' },
    { id: 2, groupName: 'Web', hotel: '%', excursion: '400 THB', tour: '2500 THB', transfer: '250 THB' },
    { id: 3, groupName: 'Travel Agent', hotel: '%', excursion: '400 THB', tour: '2500 THB', transfer: '250 THB' },
    { id: 4, groupName: 'TO Gold', hotel: '%', excursion: '200 THB', tour: '1000 THB', transfer: '100 THB' },
    { id: 5, groupName: 'TO Silver', hotel: '%', excursion: '300 THB', tour: '1500 THB', transfer: '200 THB' },
    { id: 6, groupName: 'Sales Agent', hotel: '%', excursion: '300 THB', tour: '3000 THB', transfer: '300 THB' },
    { id: 7, groupName: 'Get Your Guide', hotel: '%', excursion: '-750 THB', tour: '0 %', transfer: '0 %' },
    { id: 8, groupName: 'Admin', hotel: '%', excursion: '0 THB', tour: '0 THB', transfer: '0 THB' },
    { id: 9, groupName: 'Local DMC', hotel: '%', excursion: '-250 THB', tour: '1000 THB', transfer: '100 THB' }
  ]);

  filteredMarkups = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.markupsList().filter((m: any) => 
      m.groupName.toLowerCase().includes(query)
    );
  });

  totalItems = computed(() => this.filteredMarkups().length);

  deleteMarkup(id: number) {
    if (confirm('Are you sure you want to delete this markup group?')) {
      this.markupsList.update(list => list.filter(m => m.id !== id));
    }
  }
}
