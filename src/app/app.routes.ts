import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'quotation',
    loadComponent: () => import('./pages/quotation/quotation').then(m => m.QuotationComponent)
  },
  {
    path: 'add-quotation',
    loadComponent: () => import('./pages/add-quotation/add-quotation').then(m => m.AddQuotationComponent)
  },
  {
    path: 'control-panel/bookings',
    loadComponent: () => import('./pages/control-panel/bookings/bookings').then(m => m.BookingsComponent)
  },
  {
    path: 'control-panel/add-booking',
    loadComponent: () => import('./pages/control-panel/add-booking/add-booking').then(m => m.AddBookingComponent)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
