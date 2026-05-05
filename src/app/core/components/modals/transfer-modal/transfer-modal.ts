import { Component, output, inject, ChangeDetectionStrategy, signal, computed, input, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateInputComponent } from '../../date-input/date-input';
import { TranslationService } from '../../../services/translation.service';
import { MasterDataService } from '../../../services/master-data.service';
import { MarkupCalculatorService } from '../../../services/markup-calculator.service';

@Component({
  selector: 'app-transfer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DateInputComponent],
  templateUrl: './transfer-modal.html',
  styleUrl: './transfer-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferModalComponent implements OnInit {
  public translationService = inject(TranslationService);
  public masterData = inject(MasterDataService);
  private fb = inject(FormBuilder);
  private markupCalc = inject(MarkupCalculatorService);

  initialData = input<any>(null);
  flights = input<any[]>([]);
  minDate = input<string>('');
  agentMarkup = input<any>(null);
  public t = this.translationService.translations;

  selectedCity = signal<string>('');

  filteredTransfers = computed(() => {
    const city = this.selectedCity();
    if (!city || city === 'Select city') return this.masterData.transfers();
    return this.masterData.transfers().filter((t: any) => t.city === city);
  });
  
  close = output<void>();
  save = output<any>();

  transferForm: FormGroup;

  constructor() {
    this.transferForm = this.fb.group({
      country: ['Thailand', Validators.required],
      city: ['', Validators.required],
      date: ['', Validators.required],
      transfer: ['', Validators.required],
      display_order: [0],
      from: [''],
      to: [''],
      flight: [''],
      flightTime: [''],
      selectedFlightIndex: [''],
      tot: ['', Validators.required],
      pickupTime: [''],
      price: [0, Validators.required],
      remarks: ['']
    });

    this.transferForm.get('selectedFlightIndex')?.valueChanges.subscribe(index => {
      if (index !== '') {
        const flight = this.flights()[Number(index)];
        if (flight) {
          this.transferForm.patchValue({
            flight: `${flight.number} (${flight.flight})`,
            flightTime: flight.eat || flight.edt || ''
          });
        }
      }
    });

    this.transferForm.get('city')?.valueChanges.subscribe(val => {
      this.selectedCity.set(val);
      this.transferForm.patchValue({ transfer: '' });
    });

    this.transferForm.get('transfer')?.valueChanges.subscribe(description => {
      if (description) {
        const transfer = this.masterData.transfers().find(t => t.description === description);
        if (transfer) {
          this.transferForm.patchValue({
            from: transfer.departure,
            to: transfer.arrival
          });
        }
      }
    });

    this.selectedCity.set(this.transferForm.get('city')?.value || '');

    effect(() => {
      const d = this.initialData();
      if (d) {
        this.transferForm.patchValue({
          city: d.city,
          date: d.date,
          transfer: d.transfer_id,
          display_order: d.display_order ?? 0,
          from: d.from,
          to: d.to,
          tot: d.tot,
          pickupTime: d.pickup,
          price: d.price,
          remarks: d.remarks
        });
        this.selectedCity.set(d.city);
      } else {
        this.transferForm.reset({ country: 'Thailand', price: 0 });
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
    const description = this.transferForm.get('transfer')?.value;
    const city = this.transferForm.get('city')?.value;
    const transferObj = this.masterData.transfers().find((t: any) =>
      (t.description === description || t.id?.toString() === description?.toString()) &&
      (!city || t.city === city)
    );
    if (!transferObj) {
      this.errorMessage.set('Please select a transfer first.');
      return;
    }
    const basePrice = Number(transferObj.sic_price_adult) || 0;
    const calculated = this.markupCalc.applyMarkup(
      basePrice,
      markup.transfer_markup_unit,
      markup.transfer_markup
    );
    this.transferForm.patchValue({ price: this.markupCalc.round(calculated) });
    this.errorMessage.set(null);
  }

  errorMessage = signal<string | null>(null);

  onSave() {
    if (this.transferForm.valid) {
      this.errorMessage.set(null);
      const transferDescription = this.transferForm.get('transfer')?.value;
      const city = this.transferForm.get('city')?.value;
      
      // Try to find a matching transfer in master data for this description and city to get an ID
      const transferObj = this.masterData.transfers().find(t => 
        t.city === city && t.description === transferDescription
      );

      const data = this.transferForm.getRawValue();
      data.transfer_name = transferDescription; 
      data.transfer_id = transferObj ? transferObj.id : null;
      this.save.emit(data);
    } else {
      this.errorMessage.set('Please fill in all required fields.');
      this.transferForm.markAllAsTouched();
      setTimeout(() => {
        const firstInvalidControl = document.querySelector('.ng-invalid');
        if (firstInvalidControl) {
          (firstInvalidControl as HTMLElement).focus();
        }
      }, 100);
    }
  }
}
