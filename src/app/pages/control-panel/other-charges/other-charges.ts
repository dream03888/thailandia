import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-other-charges',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './other-charges.html',
  styleUrl: './other-charges.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OtherChargesComponent {
  private translationService = inject(TranslationService);
  public t = this.translationService.translations;

  searchQuery = signal('');
  itemsPerPage = signal(25);

  chargesList = signal<any[]>([
    { id: 1, description: 'jokhdgushgubsgoubg', amount: 2343240, type: 'Per Pax' }
  ]);

  filteredCharges = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.chargesList().filter((c: any) => 
      c.description.toLowerCase().includes(query)
    );
  });

  totalItems = computed(() => this.filteredCharges().length);

  deleteCharge(id: number) {
    if (confirm('Are you sure you want to delete this charge?')) {
      this.chargesList.update(list => list.filter(c => c.id !== id));
    }
  }
}
