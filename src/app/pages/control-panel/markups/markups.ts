import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { MarkupApiService } from '../../../core/services/api/markup-api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-markups',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './markups.html',
  styleUrl: './markups.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarkupsComponent implements OnInit {
  private translationService = inject(TranslationService);
  private markupApiService = inject(MarkupApiService);
  public t = this.translationService.translations;

  searchQuery = signal('');
  itemsPerPage = signal(25);

  markupsList = signal<any[]>([]);

  ngOnInit() {
    this.loadMarkups();
  }

  loadMarkups() {
    this.markupApiService.listMarkups().subscribe(markups => {
      this.markupsList.set(markups);
    });
  }

  filteredMarkups = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.markupsList().filter((m: any) => 
      m.groupName.toLowerCase().includes(query)
    );
  });

  totalItems = computed(() => this.filteredMarkups().length);

  deleteMarkup(id: number) {
    if (confirm('Are you sure you want to delete this markup group?')) {
      this.markupApiService.deleteMarkup(id).subscribe(() => {
        this.loadMarkups();
      });
    }
  }
}
