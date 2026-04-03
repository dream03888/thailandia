import { Component, output, inject, ChangeDetectionStrategy, signal, computed, input, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslationService } from '../../../services/translation.service';
import { MasterDataService } from '../../../services/master-data.service';

@Component({
  selector: 'app-excursion-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './excursion-modal.html',
  styleUrl: './excursion-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExcursionModalComponent implements OnInit {
  public translationService = inject(TranslationService);
  public masterData = inject(MasterDataService);
  private fb = inject(FormBuilder);

  initialData = input<any>(null);
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
      price: [{value: 0, disabled: true}],
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
    this.excursionForm.patchValue({ price: 1500 });
  }

  onSave() {
    if (this.excursionForm.valid) {
      const excursionId = this.excursionForm.get('excursion')?.value;
      const excursionObj = this.masterData.excursions().find(e => e.id == excursionId);
      const data = this.excursionForm.getRawValue();
      data.excursion_name = excursionObj ? excursionObj.name : '';
      data.excursion_id = excursionId;
      this.save.emit(data);
    } else {
      this.excursionForm.markAllAsTouched();
    }
  }
}
