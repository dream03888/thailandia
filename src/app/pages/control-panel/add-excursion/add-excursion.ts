import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { AddExcursionPriceModalComponent } from '../../../core/components/modals/add-excursion-price-modal/add-excursion-price-modal';

@Component({
  selector: 'app-add-excursion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AddExcursionPriceModalComponent],
  templateUrl: './add-excursion.html',
  styleUrl: './add-excursion.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddExcursionComponent {
  public location = inject(Location);
  public translationService = inject(TranslationService);
  public t = this.translationService.translations;
  private fb = inject(FormBuilder);

  daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  excursionForm = this.fb.group({
    name: ['', Validators.required],
    country: ['Thailand', Validators.required],
    city: ['', Validators.required],
    code: ['', Validators.required],
    supplier: ['', Validators.required],
    displayOrder: [''],
    description: ['', Validators.required],
    sicAdult: ['', Validators.required],
    sicChild: ['', Validators.required],
    validDays: this.fb.group({
      Mon: [false],
      Tue: [false],
      Wed: [false],
      Thu: [false],
      Fri: [false],
      Sat: [false],
      Sun: [false]
    })
  });

  pricesList = signal<any[]>([]);
  isPriceModalOpen = signal(false);
  editingPriceId = signal<number | null>(null);

  selectedPrice = computed(() => {
    const id = this.editingPriceId();
    if (!id) return null;
    return this.pricesList().find(p => p.id === id);
  });

  toggleDay(day: string) {
    const daysGroup = this.excursionForm.get('validDays');
    if (daysGroup) {
      const current = daysGroup.get(day)?.value;
      daysGroup.get(day)?.setValue(!current);
      daysGroup.get(day)?.markAsTouched();
    }
  }

  isDaySelected(day: string): boolean {
    return !!this.excursionForm.get('validDays')?.get(day)?.value;
  }

  addPrice() {
    this.editingPriceId.set(null);
    this.isPriceModalOpen.set(true);
  }

  editPrice(index: number) {
    const list = this.pricesList();
    if (list[index]) {
      this.editingPriceId.set(list[index].id);
      this.isPriceModalOpen.set(true);
    }
  }

  duplicatePrice(index: number) {
    this.pricesList.update(list => {
      const item = list[index];
      if (!item) return list;
      const duplicated = { ...item, id: Date.now() };
      const newList = [...list];
      newList.splice(index + 1, 0, duplicated);
      return newList;
    });
  }

  handleSavePrice(priceData: any) {
    const idToEdit = this.editingPriceId();
    if (idToEdit) {
      this.pricesList.update(list => list.map(p => p.id === idToEdit ? { ...p, ...priceData } : p));
    } else {
      this.pricesList.update(list => [
        ...list, 
        { id: Date.now(), ...priceData }
      ]);
    }
    this.isPriceModalOpen.set(false);
    this.editingPriceId.set(null);
  }

  removePrice(index: number) {
    this.pricesList.update(list => list.filter((_, i) => i !== index));
  }

  saveExcursion() {
    if (this.excursionForm.invalid) {
      this.excursionForm.markAllAsTouched();
      return;
    }
    console.log('Saving Excursion:', this.excursionForm.value, 'Prices:', this.pricesList());
    alert('Excursion Saved Successfully! (Demo)');
    this.location.back();
  }
}
