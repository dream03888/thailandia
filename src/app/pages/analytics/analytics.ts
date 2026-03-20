import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';
import { TranslationService } from '../../core/services/translation.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsComponent {
  public analyticsService = inject(AnalyticsService);
  public translationService = inject(TranslationService);
  public t = this.translationService.translations;

  onRefresh() {
    this.analyticsService.refreshData();
  }
}
