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
    path: 'add-quotation/:id',
    loadComponent: () => import('./pages/add-quotation/add-quotation').then(m => m.AddQuotationComponent)
  },
  {
    path: 'control-panel/bookings',
    loadComponent: () => import('./pages/control-panel/bookings/bookings').then(m => m.BookingsComponent)
  },
  {
    path: 'control-panel/add-booking',
    loadComponent: () => import('./pages/add-quotation/add-quotation').then(m => m.AddQuotationComponent)
  },
  {
    path: 'control-panel/add-booking/:id',
    loadComponent: () => import('./pages/add-quotation/add-quotation').then(m => m.AddQuotationComponent)
  },
  {
    path: 'control-panel/activities',
    loadComponent: () => import('./pages/control-panel/activities/activities').then(m => m.ActivitiesComponent)
  },
  {
    path: 'control-panel/agents',
    loadComponent: () => import('./pages/control-panel/agents/agents').then(m => m.AgentsComponent)
  },
  {
    path: 'control-panel/hotels',
    loadComponent: () => import('./pages/control-panel/hotels/hotels').then(m => m.HotelsComponent)
  },
  {
    path: 'control-panel/add-hotel',
    loadComponent: () => import('./pages/control-panel/add-hotel/add-hotel').then(m => m.AddHotelComponent)
  },
  {
    path: 'control-panel/excursions',
    loadComponent: () => import('./pages/control-panel/excursions/excursions').then(m => m.ExcursionsComponent)
  },
  {
    path: 'control-panel/add-excursion',
    loadComponent: () => import('./pages/control-panel/add-excursion/add-excursion').then(m => m.AddExcursionComponent)
  },
  {
    path: 'control-panel/add-agent',
    loadComponent: () => import('./pages/control-panel/add-agent/add-agent').then(m => m.AddAgentComponent)
  },
  {
    path: 'payment',
    loadComponent: () => import('./pages/payment/payment').then(m => m.PaymentComponent)
  },
  {
    path: 'itinerary',
    loadComponent: () => import('./pages/itinerary/itinerary').then(m => m.ItineraryComponent)
  },
  {
    path: 'analytics',
    loadComponent: () => import('./pages/analytics/analytics').then(m => m.AnalyticsComponent)
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
