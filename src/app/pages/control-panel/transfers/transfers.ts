import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { TransferApiService } from '../../../core/services/api/transfer-api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transfers',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './transfers.html',
  styleUrl: './transfers.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransfersComponent implements OnInit {
  private translationService = inject(TranslationService);
  private transferApiService = inject(TransferApiService);
  public t = this.translationService.translations;

  searchQuery = signal('');
  itemsPerPage = signal(25);

  transfersList = signal<any[]>([]);

  ngOnInit() {
    this.loadTransfers();
  }

  loadTransfers() {
    this.transferApiService.listTransfers().subscribe(data => {
      this.transfersList.set(data);
    });
  }

  filteredTransfers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.transfersList().filter((tr: any) => 
      (tr.city && tr.city.toLowerCase().includes(query)) || 
      (tr.supplier && tr.supplier.toLowerCase().includes(query)) ||
      (tr.departure && tr.departure.toLowerCase().includes(query)) ||
      (tr.arrival && tr.arrival.toLowerCase().includes(query)) ||
      (tr.description && tr.description.toLowerCase().includes(query))
    );
  });

  totalItems = computed(() => this.filteredTransfers().length);

  deleteTransfer(id: number | string) {
    if (confirm('Are you sure you want to delete this transfer?')) {
      this.transferApiService.deleteTransfer(id).subscribe(() => {
        this.loadTransfers();
      });
    }
  }
}
