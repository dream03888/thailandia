import { Component, output, inject, ChangeDetectionStrategy, signal, computed, input, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateInputComponent } from '../../date-input/date-input';
import { TranslationService } from '../../../services/translation.service';
import { MasterDataService } from '../../../services/master-data.service';
import { MarkupCalculatorService } from '../../../services/markup-calculator.service';

@Component({
  selector: 'app-excursion-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DateInputComponent],
  templateUrl: './excursion-modal.html',
  styleUrl: './excursion-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExcursionModalComponent implements OnInit {
  public translationService = inject(TranslationService);
  public masterData = inject(MasterDataService);
  private fb = inject(FormBuilder);
  private markupCalc = inject(MarkupCalculatorService);

  initialData = input<any>(null);
  minDate = input<string>('');
  agentMarkup = input<any>(null);
  numberOfAdults = input<number>(0);
  numberOfChildren = input<number>(0);
  public t = this.translationService.translations;

  selectedCity = signal<string>('');

  filteredExcursions = computed(() => {
    const city = this.selectedCity();
    if (!city || city === 'Select city') return this.masterData.excursions();
    return this.masterData.excursions().filter((e: any) => e.city === city);
  });
  
  close = output<void>();
  save = output<any>();

  excursionForm: FormGroup;

  constructor() {
    this.excursionForm = this.fb.group({
      country: ['Thailand', Validators.required],
      city: ['', Validators.required],
      date: ['', Validators.required],
      excursion: ['', Validators.required], // Will store excursion ID
      hotel: ['', Validators.required],
      pickupTime: [''],
      typeOfExcursion: ['', Validators.required],
      price: [0, Validators.required],
      remarks: ['']
    });

    this.excursionForm.get('city')?.valueChanges.subscribe(val => {
      this.selectedCity.set(val);
      this.excursionForm.patchValue({ excursion: '' });
    });
    this.selectedCity.set(this.excursionForm.get('city')?.value || '');

    effect(() => {
      const d = this.initialData();
      if (d) {
        this.excursionForm.patchValue({
          city: d.city || '',
          date: d.date || '',
          excursion: d.excursion_id || '',
          hotel: d.hotel || '',
          pickupTime: d.pickup || '',
          typeOfExcursion: d.toe || '',
          price: d.price || 0,
          remarks: d.remarks || ''
        });
        this.selectedCity.set(d.city || '');
      } else {
        this.excursionForm.reset({ country: 'Thailand', price: 0 });
      }
    });
  }

  ngOnInit() {}

  getPrice() {
    const markup = this.agentMarkup();
    if (!markup) {
      this.errorMessage.set('No markup configured for this agent. Please assign a markup group first.');
      return;
    }
    const excursionId = this.excursionForm.get('excursion')?.value;
    const excursionObj = this.masterData.excursions().find((e: any) =>
      e.id?.toString() === excursionId?.toString()
    );
    if (!excursionObj) {
      this.errorMessage.set('Please select an excursion first.');
      return;
    }
    const adults = this.numberOfAdults();
    const children = this.numberOfChildren();
    const adultBase = Number(excursionObj.sic_price_adult) || 0;
    const childBase = Number(excursionObj.sic_price_child) || 0;
    // คำนวณ markup ต่อ unit ก่อน แล้วค่อยคูณจำนวนคน
    const adultWithMarkup = this.markupCalc.applyMarkup(adultBase, markup.excursion_markup_unit, markup.excursion_markup);
    const childWithMarkup = this.markupCalc.applyMarkup(childBase, markup.excursion_markup_unit, markup.excursion_markup);
    const total = this.markupCalc.round((adultWithMarkup * adults) + (childWithMarkup * children));
    this.excursionForm.patchValue({ price: total });
    this.errorMessage.set(null);
  }

  errorMessage = signal<string | null>(null);

  onSave() {
    if (this.excursionForm.valid) {
      this.errorMessage.set(null);
      const excursionId = this.excursionForm.get('excursion')?.value;
      const excursionObj = this.masterData.excursions().find(e => e.id == excursionId);
      const data = this.excursionForm.getRawValue();
      data.excursion_name = excursionObj ? excursionObj.name : '';
      data.excursion_id = excursionId;
      this.save.emit(data);
    } else {
      this.errorMessage.set('Please fill in all required fields.');
      this.excursionForm.markAllAsTouched();
      setTimeout(() => {
        const firstInvalidControl = document.querySelector('.ng-invalid');
        if (firstInvalidControl) {
          (firstInvalidControl as HTMLElement).focus();
        }
      }, 100);
    }
  }
}
