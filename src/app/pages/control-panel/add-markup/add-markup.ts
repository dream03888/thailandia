import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { AddMarkupRangeModalComponent } from '../../../core/components/modals/add-markup-range-modal/add-markup-range-modal';

@Component({
  selector: 'app-add-markup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AddMarkupRangeModalComponent],
  templateUrl: './add-markup.html',
  styleUrl: './add-markup.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddMarkupComponent {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private translationService = inject(TranslationService);
  public t = this.translationService.translations;

  markupForm = this.fb.group({
    groupName: ['', Validators.required],
    hotelMarkupUnit: ['%'],
    excursionMarkupUnit: ['THB'],
    excursionMarkupValue: [null as number | null],
    tourMarkupUnit: ['THB'],
    tourMarkupValue: [null as number | null],
    transferMarkupUnit: ['THB'],
    transferMarkupValue: [null as number | null]
  });

  hotelRanges = signal<any[]>([]);
  isRangeModalOpen = signal(false);
  selectedRange = signal<any | null>(null);

  goBack() {
    this.location.back();
  }

  saveMarkup() {
    if (this.markupForm.valid) {
      console.log('Markup Data:', {
        ...this.markupForm.value,
        hotelRanges: this.hotelRanges()
      });
      this.goBack();
    } else {
      this.markupForm.markAllAsTouched();
    }
  }

  openRangeModal(range: any | null = null, index: number | null = null) {
    if (range && index !== null) {
      this.selectedRange.set({ ...range, id: index });
    } else {
      this.selectedRange.set(null);
    }
    this.isRangeModalOpen.set(true);
  }

  handleSaveRange(data: any) {
    this.hotelRanges.update(list => {
      const newList = [...list];
      if (data.id !== undefined && data.id !== null) {
        newList[data.id] = data;
      } else {
        newList.push(data);
      }
      return newList;
    });
    this.isRangeModalOpen.set(false);
  }

  removeRange(index: number) {
    if (confirm('Are you sure you want to remove this range?')) {
      this.hotelRanges.update(list => list.filter((_, i) => i !== index));
    }
  }
}
