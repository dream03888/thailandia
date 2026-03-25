import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsersComponent {
  private translationService = inject(TranslationService);
  public t = this.translationService.translations;

  searchQuery = signal('');
  itemsPerPage = signal(25);

  usersList = signal<any[]>([
    { id: 1, name: 'Adamantis', role: 'agent', agent: 'Adamantis Viaggi', email: 'sandro@adamantisviaggi.it' },
    { id: 2, name: 'Asian Trails', role: 'agent', agent: 'Asian Trails Thailand', email: 'simon@asiantrails.org' },
    { id: 3, name: 'Bangkok Agent', role: 'admin', agent: 'VeraThailandia Test', email: 'boonskipper.13@gmail.com' },
    { id: 4, name: 'Eclisse', role: 'agent', agent: 'Eclisse Viaggi', email: 'booking@verathailandia.com' },
    { id: 5, name: 'Fantasia', role: 'agent', agent: 'Fantasia Asia Travel Service', email: 'booking@fantasiaasia.com' },
    { id: 6, name: 'Get Your Guide', role: 'agent', agent: 'Get Your Guide', email: 'accounting@verathailandia.com' },
    { id: 7, name: 'Going', role: 'agent', agent: 'Going Tour Operator', email: 'cristian.vacca@going.it' },
    { id: 8, name: 'Mimmo', role: 'agent', agent: 'Mimmo', email: 'domenicobitonte@yahoo.com' },
    { id: 9, name: 'MondoColorato', role: 'agent', agent: 'Il Mondo Colorato', email: 'info@verathailandia.com' }
  ]);

  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.usersList().filter((u: any) => 
      u.name.toLowerCase().includes(query) || 
      u.email.toLowerCase().includes(query) ||
      u.agent.toLowerCase().includes(query)
    );
  });

  totalItems = computed(() => this.filteredUsers().length);

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.usersList.update(list => list.filter(u => u.id !== id));
    }
  }
}
