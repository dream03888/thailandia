import { Component, output, inject, ChangeDetectionStrategy, signal, computed, input, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateInputComponent } from '../../date-input/date-input';
import { TranslationService } from '../../../services/translation.service';
import { MasterDataService } from '../../../services/master-data.service';
import { MarkupCalculatorService } from '../../../services/markup-calculator.service';

@Component({
  selector: 'app-tour-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DateInputComponent],
  templateUrl: './tour-modal.html',
  styleUrl: './tour-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TourModalComponent implements OnInit {
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

  filteredTours = computed(() => {
    const city = this.selectedCity();
    if (!city || city === 'Select city') return this.masterData.tours();
    return this.masterData.tours().filter((t: any) => t.city === city);
  });
  
  close = output<void>();
  save = output<any>();

  tourForm: FormGroup;

  constructor() {
    this.tourForm = this.fb.group({
      country: ['Thailand', Validators.required],
      startCity: ['', Validators.required],
      tour: ['', Validators.required], // Will store tour ID
      route: [''],
      startDate: [''],
      endDate: [''],
      singleRoom: [false],
      singleRoomCount: [0],
      doubleRoom: [false],
      doubleRoomCount: [0],
      tripleRoom: [false],
      tripleRoomCount: [0],
      pax: [{value: 0, disabled: true}],
      tot: ['', Validators.required],
      flightIn: [''],
      arrivalTime: [''],
      flightOut: [''],
      departureTime: [''],
      display_order: [0],
      price: [{value: 0, disabled: true}],
      remarks: ['']
    });

    this.tourForm.get('startCity')?.valueChanges.subscribe(val => {
      this.selectedCity.set(val);
      this.tourForm.patchValue({ tour: '' });
    });
    this.selectedCity.set(this.tourForm.get('startCity')?.value || '');

    effect(() => {
      const d = this.initialData();
      if (d) {
        this.tourForm.patchValue({
          startCity: d.city || '',
          tour: d.tour_id || '',
          route: d.route || '',
          pax: d.pax || 0,
          tot: d.tot || '',
          display_order: d.display_order ?? 0,
          price: d.price || 0,
          remarks: d.remarks || ''
        });
        this.selectedCity.set(d.city || '');
      } else {
        this.tourForm.reset({ country: 'Thailand', price: 0 });
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
    const tourId = this.tourForm.get('tour')?.value;
    const tourObj = this.masterData.tours().find((t: any) =>
      t.id?.toString() === tourId?.toString()
    );
    if (!tourObj) {
      this.errorMessage.set('Please select a tour first.');
      return;
    }
    const adults = this.numberOfAdults();
    const children = this.numberOfChildren();
    // Tour ใช้ sic_price_adult/child เหมือน excursion
    const adultBase = Number(tourObj.sic_price_adult || tourObj.base_price || 0);
    const childBase = Number(tourObj.sic_price_child || 0);
    const adultWithMarkup = this.markupCalc.applyMarkup(adultBase, markup.tour_markup_unit, markup.tour_markup);
    const childWithMarkup = this.markupCalc.applyMarkup(childBase, markup.tour_markup_unit, markup.tour_markup);
    const total = this.markupCalc.round((adultWithMarkup * adults) + (childWithMarkup * children));
    this.tourForm.patchValue({ price: total });
    this.errorMessage.set(null);
  }

  errorMessage = signal<string | null>(null);

  onSave() {
    if (this.tourForm.valid) {
      this.errorMessage.set(null);
      const tourId = this.tourForm.get('tour')?.value;
      const tourObj = this.masterData.tours().find(t => t.id == tourId);
      const data = this.tourForm.getRawValue();
      data.tour_name = tourObj ? tourObj.name : '';
      data.tour_id = tourId;
      this.save.emit(data);
    } else {
      this.errorMessage.set('Please fill in all required fields.');
      this.tourForm.markAllAsTouched();
      setTimeout(() => {
        const firstInvalidControl = document.querySelector('.ng-invalid');
        if (firstInvalidControl) {
          (firstInvalidControl as HTMLElement).focus();
        }
      }, 100);
    }
  }
}
