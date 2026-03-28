import { Component, ChangeDetectionStrategy, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { ExcursionApiService } from '../../../core/services/api/excursion-api.service';

@Component({
  selector: 'app-excursions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './excursions.html',
  styleUrl: './excursions.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExcursionsComponent implements OnInit {
  private translationService = inject(TranslationService);
  private excursionApiService = inject(ExcursionApiService);
  public t = this.translationService.translations;

  excursionsList = signal<any[]>([]);
  filteredExcursions = signal<any[]>([]);

  ngOnInit() {
    this.loadExcursions();
  }

  loadExcursions() {
    this.excursionApiService.listExcursions().subscribe(data => {
      this.excursionsList.set(data);
      this.filteredExcursions.set(data);
    });
  }

  filterExcursions(query: string) {
    const q = query.toLowerCase();
    this.filteredExcursions.set(
      this.excursionsList().filter(a => 
        a.name.toLowerCase().includes(q) || 
        (a.city && a.city.toLowerCase().includes(q)) ||
        (a.supplier_name && a.supplier_name.toLowerCase().includes(q))
      )
    );
  }

  deleteExcursion(id: string | number) {
    if (confirm(`Delete excursion?`)) {
      this.excursionApiService.deleteExcursion(id).subscribe(() => {
        this.loadExcursions();
      });
    }
  }
}
