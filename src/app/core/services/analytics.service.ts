import { Injectable, signal } from '@angular/core';

export interface DashboardMetrics {
  totalQuotations: { value: number, change: string };
  confirmedBookings: { value: number, change: string };
  conversionRate: { value: number, change: string };
  averageDealSize: { value: number, change: string };
  avgCloseTime: { value: number, change: string };
  winRate: { value: number, change: string };
  
  monthlyRevenue: { value: number, change: string };
  collectionRate: { value: number, change: string };
  quotationsPerWeek: { value: number, change: string };
  outstandingAmount: { value: number, change: string };
  
  repeatCustomerRate: { value: number, change: string };
  totalUniqueClients: { value: number, change: string };
  highValueBookings: { value: number, change: string };
  mediumValueBookings: { value: number, change: string };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  public metrics = signal<DashboardMetrics>({
    totalQuotations: { value: 9, change: '\u2191 12% vs last month' },
    confirmedBookings: { value: 8, change: '\u2191 8% vs last month' },
    conversionRate: { value: 88.9, change: '\u2192 no change' },
    averageDealSize: { value: 40.6, change: '\u2192 no change' }, // Represented in 'K'
    avgCloseTime: { value: 2.0, change: '\u2191 faster by 0.5d' },
    winRate: { value: 0.3, change: '\u2193 2% vs last month' },
    
    monthlyRevenue: { value: 324.5, change: '\u2191 18% vs last month' }, // Represented in 'K'
    collectionRate: { value: 0.0, change: '\u2192 no change' },
    quotationsPerWeek: { value: 0.00, change: '\u2192 no change' },
    outstandingAmount: { value: 324.5, change: '\u2191 8% vs last month' },
    
    repeatCustomerRate: { value: 0.0, change: '\u2192 no change' },
    totalUniqueClients: { value: 0, change: '\u2192 no change' },
    highValueBookings: { value: 0, change: '\u2192 no change' },
    mediumValueBookings: { value: 0, change: '\u2192 no change' }
  });

  refreshData() {
    // Mock updating logic
    const current = this.metrics();
    this.metrics.set({
      ...current,
      totalQuotations: { value: current.totalQuotations.value + 1, change: '\u2191 14% vs last month' },
      confirmedBookings: { value: current.confirmedBookings.value + 1, change: '\u2191 10% vs last month' },
      monthlyRevenue: { value: current.monthlyRevenue.value + 15.5, change: '\u2191 21% vs last month' }
    });
  }
}
