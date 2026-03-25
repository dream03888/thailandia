import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuppliersComponent {
  private translationService = inject(TranslationService);
  public t = this.translationService.translations;

  searchQuery = signal('');
  itemsPerPage = signal(25);

  suppliersList = signal<any[]>([
    { id: 1, name: 'WheelsApart', email: 'varunjain0606@gmail.com', phone: '09538178599', services: ['Transfers', 'Excursions', 'Tours'], description: 'Testing supplier' },
    { id: 2, name: 'Sirinya Transportation Company', email: 'sirinyatransport.van@gmail.com', phone: '0894800127', services: ['Transfers', 'Tours'], description: 'Cars suppliers' },
    { id: 3, name: 'Fantasia Asia Travel Service', email: 'booking@fantasiaasia.com', phone: '0891131015', services: ['Transfers', 'Excursions'], description: 'Suppliers for transfers and excursions' },
    { id: 4, name: 'Chiang Rai World Tour', email: 'm.9kritcei@gmail.com', phone: '0982501767', services: ['Transfers'], description: 'Suppliers for transfers' },
    { id: 5, name: 'Go Vacation Thailand', email: 'sales@go-vacation.com', phone: '022671202', services: ['Transfers'], description: 'Supplier for transfers' },
    { id: 6, name: 'VeraThailandia', email: 'reservation@verathailandia.com', phone: '021266914', services: ['Transfers', 'Excursions', 'Tours', 'Hotels'], description: 'Supplier for transfers, excursions, tours, hotels' },
    { id: 7, name: 'Papaiteow Transportation Company', email: 'joice.jatu@gmail.com', phone: '0861649336', services: ['Transfers', 'Excursions'], description: 'Suppliers for transfers and excursions' },
    { id: 8, name: 'Asia Sensation Travel', email: 'info@verathailandia.com', phone: '076374522', services: ['Transfers', 'Excursions'], description: 'Supplier for transfers and excursions' },
    { id: 9, name: 'Grand Pearl Co.,Ltd', email: 'rsvn@grandpearlcruise.com', phone: '028610255', services: ['Transfers', 'Excursions'], description: 'Dinner Cruises and Ayutthaya Tour' }
  ]);

  filteredSuppliers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.suppliersList().filter((s: any) => 
      s.name.toLowerCase().includes(query) || 
      s.email.toLowerCase().includes(query)
    );
  });

  totalItems = computed(() => this.filteredSuppliers().length);

  deleteSupplier(id: number) {
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.suppliersList.update(list => list.filter(s => s.id !== id));
    }
  }
}
