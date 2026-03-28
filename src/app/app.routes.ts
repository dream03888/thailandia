import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'quotation',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/quotation/quotation').then(m => m.QuotationComponent)
  },
  {
    path: 'add-quotation',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/add-quotation/add-quotation').then(m => m.AddQuotationComponent)
  },
  {
    path: 'add-quotation/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/add-quotation/add-quotation').then(m => m.AddQuotationComponent)
  },
  {
    path: 'control-panel/bookings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/bookings/bookings').then(m => m.BookingsComponent)
  },
  {
    path: 'control-panel/add-booking',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/add-quotation/add-quotation').then(m => m.AddQuotationComponent)
  },
  {
    path: 'control-panel/add-booking/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/add-quotation/add-quotation').then(m => m.AddQuotationComponent)
  },
  {
    path: 'control-panel/activities',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/activities/activities').then(m => m.ActivitiesComponent)
  },
  {
    path: 'control-panel/agents',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/agents/agents').then(m => m.AgentsComponent)
  },
  {
    path: 'control-panel/hotels',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/hotels/hotels').then(m => m.HotelsComponent)
  },
  {
    path: 'control-panel/add-hotel',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-hotel/add-hotel').then(m => m.AddHotelComponent)
  },
  {
    path: 'control-panel/add-hotel/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-hotel/add-hotel').then(m => m.AddHotelComponent)
  },
  {
    path: 'control-panel/excursions',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/excursions/excursions').then(m => m.ExcursionsComponent)
  },
  {
    path: 'control-panel/add-excursion',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-excursion/add-excursion').then(m => m.AddExcursionComponent)
  },
  {
    path: 'control-panel/add-excursion/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-excursion/add-excursion').then(m => m.AddExcursionComponent)
  },
  {
    path: 'control-panel/markups',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/markups/markups').then(m => m.MarkupsComponent)
  },
  {
    path: 'control-panel/add-markup',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-markup/add-markup').then(m => m.AddMarkupComponent)
  },
  {
    path: 'control-panel/add-markup/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-markup/add-markup').then(m => m.AddMarkupComponent)
  },
  {
    path: 'control-panel/users',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/users/users').then(m => m.UsersComponent)
  },
  {
    path: 'control-panel/add-user',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-user/add-user').then(m => m.AddUserComponent)
  },
  {
    path: 'control-panel/add-user/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-user/add-user').then(m => m.AddUserComponent)
  },
  {
    path: 'control-panel/suppliers',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/suppliers/suppliers').then(m => m.SuppliersComponent)
  },
  {
    path: 'control-panel/add-supplier',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-supplier/add-supplier').then(m => m.AddSupplierComponent)
  },
  {
    path: 'control-panel/add-supplier/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-supplier/add-supplier').then(m => m.AddSupplierComponent)
  },
  {
    path: 'control-panel/other-charges',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/other-charges/other-charges').then(m => m.OtherChargesComponent)
  },
  {
    path: 'control-panel/add-other-charge',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-other-charge/add-other-charge').then(m => m.AddOtherChargeComponent)
  },
  {
    path: 'control-panel/add-other-charge/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-other-charge/add-other-charge').then(m => m.AddOtherChargeComponent)
  },
  {
    path: 'control-panel/add-agent',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-agent/add-agent').then(m => m.AddAgentComponent)
  },
  {
    path: 'control-panel/add-agent/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-agent/add-agent').then(m => m.AddAgentComponent)
  },
  {
    path: 'payment',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/payment/payment').then(m => m.PaymentComponent)
  },
  {
    path: 'itinerary',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/itinerary/itinerary').then(m => m.ItineraryComponent)
  },
  {
    path: 'control-panel/transfers',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/transfers/transfers').then(m => m.TransfersComponent)
  },
  {
    path: 'control-panel/add-transfer',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-transfer/add-transfer').then(m => m.AddTransferComponent)
  },
  {
    path: 'control-panel/add-transfer/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-transfer/add-transfer').then(m => m.AddTransferComponent)
  },
  {
    path: 'control-panel/tools',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/tools/tools').then(m => m.ToolsComponent)
  },
  {
    path: 'control-panel/tours',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/tours/tours').then(m => m.ToursComponent)
  },
  {
    path: 'control-panel/add-tour',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-tour/add-tour').then(m => m.AddTourComponent)
  },
  {
    path: 'control-panel/add-tour/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/control-panel/add-tour/add-tour').then(m => m.AddTourComponent)
  },
  {
    path: 'analytics',
    canActivate: [authGuard],
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
