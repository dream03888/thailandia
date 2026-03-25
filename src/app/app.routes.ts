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
    path: 'control-panel/markups',
    loadComponent: () => import('./pages/control-panel/markups/markups').then(m => m.MarkupsComponent)
  },
  {
    path: 'control-panel/users',
    loadComponent: () => import('./pages/control-panel/users/users').then(m => m.UsersComponent)
  },
  {
    path: 'control-panel/add-user',
    loadComponent: () => import('./pages/control-panel/add-user/add-user').then(m => m.AddUserComponent)
  },
  {
    path: 'control-panel/suppliers',
    loadComponent: () => import('./pages/control-panel/suppliers/suppliers').then(m => m.SuppliersComponent)
  },
  {
    path: 'control-panel/add-supplier',
    loadComponent: () => import('./pages/control-panel/add-supplier/add-supplier').then(m => m.AddSupplierComponent)
  },
  {
    path: 'control-panel/other-charges',
    loadComponent: () => import('./pages/control-panel/other-charges/other-charges').then(m => m.OtherChargesComponent)
  },
  {
    path: 'control-panel/add-other-charge',
    loadComponent: () => import('./pages/control-panel/add-other-charge/add-other-charge').then(m => m.AddOtherChargeComponent)
  },
  {
    path: 'control-panel/add-markup',
    loadComponent: () => import('./pages/control-panel/add-markup/add-markup').then(m => m.AddMarkupComponent)
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
    path: 'control-panel/transfers',
    loadComponent: () => import('./pages/control-panel/transfers/transfers').then(m => m.TransfersComponent)
  },
  {
    path: 'control-panel/add-transfer',
    loadComponent: () => import('./pages/control-panel/add-transfer/add-transfer').then(m => m.AddTransferComponent)
  },
  {
    path: 'control-panel/tools',
    loadComponent: () => import('./pages/control-panel/tools/tools').then(m => m.ToolsComponent)
  },
  {
    path: 'control-panel/tours',
    loadComponent: () => import('./pages/control-panel/tours/tours').then(m => m.ToursComponent)
  },
  {
    path: 'control-panel/add-tour',
    loadComponent: () => import('./pages/control-panel/add-tour/add-tour').then(m => m.AddTourComponent)
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
