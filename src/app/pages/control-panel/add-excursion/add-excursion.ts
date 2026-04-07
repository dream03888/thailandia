import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { ExcursionApiService } from '../../../core/services/api/excursion-api.service';
import { AddExcursionPriceModalComponent } from '../../../core/components/modals/add-excursion-price-modal/add-excursion-price-modal';
import { AddCityModalComponent } from '../../../core/components/modals/add-city-modal/add-city-modal';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-add-excursion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AddExcursionPriceModalComponent, AddCityModalComponent],
  templateUrl: './add-excursion.html',
  styleUrl: './add-excursion.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddExcursionComponent implements OnInit {
  public location = inject(Location);
  public translationService = inject(TranslationService);
  public t = this.translationService.translations;
  private fb = inject(FormBuilder);
  private excursionApiService = inject(ExcursionApiService);
  private route = inject(ActivatedRoute);
  private cd = inject(ChangeDetectorRef);
  public authService = inject(AuthService);
  private toastService = inject(ToastService);
  viewOnly = signal(false);

  excursionId = signal<string | null>(null);
  daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  excursionForm = this.fb.group({
    name: ['', Validators.required],
    country: ['Thailand', Validators.required],
    city: ['', Validators.required],
    code: ['', Validators.required],
    supplier: ['', Validators.required],
    displayOrder: [0],
    description: ['', Validators.required],
    sicAdult: [0, Validators.required],
    sicChild: [0, Validators.required],
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
  
  isCityModalOpen = signal(false);

  selectedPrice = computed(() => {
    const id = this.editingPriceId();
    if (id === null) return null;
    return this.pricesList().find(p => p.id === id);
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const mode = this.route.snapshot.queryParamMap.get('mode');

    const pageId = 'cp_excursions';
    const hasAddPerm = this.authService.canAdd(pageId);
    const hasEditPerm = this.authService.canEdit(pageId);

    if (mode === 'view' || (id && !hasEditPerm)) {
      this.viewOnly.set(true);
      this.excursionForm.disable();
    }

    if (!id && !hasAddPerm) {
      this.toastService.error('You do not have permission to add new excursions');
      this.goBack();
      return;
    }

    if (id) {
      this.excursionId.set(id);
      this.excursionApiService.getExcursion(id).subscribe(excursion => {
        this.excursionForm.patchValue({
          name: excursion.name,
          city: excursion.city,
          code: excursion.code,
          description: excursion.description,
          sicAdult: excursion.sic_price_adult,
          sicChild: excursion.sic_price_child,
          supplier: excursion.supplier_name
        });

        // Map valid days string "Mon,Tue" -> checkbox group
        if (excursion.valid_days) {
          const daysArray = excursion.valid_days.split(',');
          const daysGroup: any = {};
          this.daysOfWeek.forEach(d => {
            daysGroup[d] = daysArray.includes(d);
          });
          this.excursionForm.get('validDays')?.patchValue(daysGroup);
        }

        // Map prices
        if (excursion.prices) {
          this.pricesList.set(excursion.prices.map((p: any) => ({
            id: p.id,
            dateFrom: p.start_date ? p.start_date.split('T')[0] : '',
            dateTo: p.end_date ? p.end_date.split('T')[0] : '',
            pax: p.pax,
            price: p.price
          })));
        }
        
        this.cd.markForCheck();
      });
    }
  }

  goBack() {
    this.location.back();
  }

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
      const duplicated = { ...item, id: Date.now() + Math.random() };
      const newList = [...list];
      newList.splice(index + 1, 0, duplicated);
      return newList;
    });
  }

  handleSavePrice(priceData: any) {
    const idToEdit = this.editingPriceId();
    if (idToEdit !== null) {
      this.pricesList.update(list => list.map(p => p.id === idToEdit ? { ...p, ...priceData } : p));
    } else {
      this.pricesList.update(list => [
        ...list, 
        { id: Date.now() + Math.random(), ...priceData }
      ]);
    }
    this.isPriceModalOpen.set(false);
    this.editingPriceId.set(null);
  }

  handleSaveCity(cityName: string) {
    this.excursionForm.get('city')?.setValue(cityName);
    this.isCityModalOpen.set(false);
    this.cd.markForCheck();
  }

  removePrice(index: number) {
    this.pricesList.update(list => list.filter((_, i) => i !== index));
  }

  saveExcursion() {
    if (this.excursionForm.invalid) {
      this.excursionForm.markAllAsTouched();
      return;
    }

    const formVal = this.excursionForm.value;
    const validDaysVal = formVal.validDays as any;
    const validDaysStr = Object.keys(validDaysVal)
      .filter(d => validDaysVal[d])
      .join(',');

    const payload = {
      name: formVal.name,
      city: formVal.city,
      code: formVal.code,
      description: formVal.description,
      sic_price_adult: formVal.sicAdult,
      sic_price_child: formVal.sicChild,
      supplier_name: formVal.supplier,
      valid_days: validDaysStr,
      prices: this.pricesList().map(p => ({
        start_date: p.dateFrom,
        end_date: p.dateTo,
        pax: p.pax,
        price: p.price,
        cost: p.price, // Default cost to price
        currency_id: 1 // Default to THB
      }))
    };

    const id = this.excursionId();
    if (id) {
      this.excursionApiService.updateExcursion(id, payload).subscribe({
        next: () => {
          this.location.back();
        },
        error: (err) => {
          console.error('Error updating excursion:', err);
          alert('Failed to update excursion');
        }
      });
    } else {
      this.excursionApiService.createExcursion(payload).subscribe({
        next: () => {
          this.location.back();
        },
        error: (err) => {
          console.error('Error creating excursion:', err);
          alert('Failed to create excursion');
        }
      });
    }
  }
}
