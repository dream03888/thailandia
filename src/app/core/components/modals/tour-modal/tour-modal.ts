import { Component, output, inject, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslationService } from '../../../services/translation.service';
import { MasterDataService } from '../../../services/master-data.service';

@Component({
  selector: 'app-tour-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tour-modal.html',
  styleUrl: './tour-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TourModalComponent {
  public translationService = inject(TranslationService);
  public masterData = inject(MasterDataService);
  private fb = inject(FormBuilder);
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
      price: [{value: 0, disabled: true}],
      remarks: ['']
    });

    this.tourForm.get('startCity')?.valueChanges.subscribe(val => {
      this.selectedCity.set(val);
      this.tourForm.patchValue({ tour: '' });
    });
    this.selectedCity.set(this.tourForm.get('startCity')?.value || '');
  }

  getPrice() {
    this.tourForm.patchValue({ price: 8500 });
  }

  onSave() {
    if (this.tourForm.valid) {
      const tourId = this.tourForm.get('tour')?.value;
      const tourObj = this.masterData.tours().find(t => t.id == tourId);
      const data = this.tourForm.getRawValue();
      data.tour_name = tourObj ? tourObj.name : '';
      data.tour_id = tourId;
      this.save.emit(data);
    } else {
      this.tourForm.markAllAsTouched();
    }
  }
}
