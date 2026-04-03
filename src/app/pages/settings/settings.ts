import { Component, inject, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../core/services/translation.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit {
  private http = inject(HttpClient);
  private translationService = inject(TranslationService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  public t = this.translationService.translations;
  users = signal<any[]>([]);
  isLoading = signal(false);
  expandedUserId = signal<number | null>(null);
  
  // Categorized pages for better UI
  permissionGroups = [
    {
      name: 'Main Applications',
      icon: 'fa-layer-group',
      pages: [
        { id: 'home', label: 'Home' },
        { id: 'quotation', label: 'Quotations' },
        { id: 'payment', label: 'Payment' },
        { id: 'itinerary', label: 'Itinerary' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'settings', label: 'Settings' }
      ]
    },
    {
      name: 'Control Panel Modules',
      icon: 'fa-screwdriver-wrench',
      pages: [
        { id: 'cp_activities', label: 'Activities' },
        { id: 'cp_agents', label: 'Agents' },
        { id: 'cp_bookings', label: 'Bookings' },
        { id: 'cp_excursions', label: 'Excursions' },
        { id: 'cp_hotels', label: 'Hotels' },
        { id: 'cp_markups', label: 'Markups' },
        { id: 'cp_other_charges', label: 'Other Charges' },
        { id: 'cp_suppliers', label: 'Suppliers' },
        { id: 'cp_tools', label: 'Tools' },
        { id: 'cp_tours', label: 'Tours' },
        { id: 'cp_transfers', label: 'Transfers' },
        { id: 'cp_users', label: 'Users' }
      ]
    }
  ];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.isLoading.set(true);
    this.http.get<any[]>(`${environment.apiUrl}/users`).subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load users');
        this.isLoading.set(false);
      }
    });
  }

  toggleExpand(userId: number) {
    if (this.expandedUserId() === userId) {
      this.expandedUserId.set(null);
    } else {
      this.expandedUserId.set(userId);
    }
  }

  getActivePagesCount(user: any): number {
    if (user.role === 'superadmin') return 19; // Total pages
    return user.permissions?.pages?.length || 0;
  }

  updateUserRole(userId: number, newRole: string) {
    this.http.patch(`${environment.apiUrl}/users/${userId}/role`, { role: newRole }).subscribe({
      next: () => {
        this.toastService.success(`User role updated to ${newRole}`);
        this.loadUsers();
      },
      error: () => this.toastService.error('Failed to update role')
    });
  }

  togglePagePermission(user: any, pageId: string) {
    const perms = { ...user.permissions };
    if (!perms.pages) perms.pages = [];
    
    if (perms.pages.includes(pageId)) {
      perms.pages = perms.pages.filter((p: string) => p !== pageId);
    } else {
      perms.pages.push(pageId);
    }

    this.updatePermissions(user.id, perms);
  }

  toggleNotifications(user: any) {
    const perms = { ...user.permissions };
    perms.notifications_enabled = !perms.notifications_enabled;
    this.updatePermissions(user.id, perms);
  }

  private updatePermissions(userId: number, permissions: any) {
    this.http.patch(`${environment.apiUrl}/users/${userId}/permissions`, { permissions }).subscribe({
      next: () => {
        this.toastService.success('Permissions updated successfully');
        this.loadUsers();
      },
      error: () => this.toastService.error('Failed to update permissions')
    });
  }
}
