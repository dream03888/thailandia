import { Component, output, inject, ChangeDetectionStrategy, signal, computed, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslationService } from '../../../services/translation.service';
import { MasterDataService } from '../../../services/master-data.service';

@Component({
  selector: 'app-transfer-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transfer-modal.html',
  styleUrl: './transfer-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferModalComponent implements OnInit {
  public translationService = inject(TranslationService);
  public masterData = inject(MasterDataService);
  private fb = inject(FormBuilder);

  initialData = input<any>(null);
  flights = input<any[]>([]);
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
      transfer: ['', Validators.required], // Will store transfer ID
      from: [''],
      to: [''],
      flight: [''],
      flightTime: [''],
      selectedFlightIndex: [''],
      tot: ['', Validators.required],
      pickupTime: [''],
      price: [{value: 0, disabled: true}],
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
    this.selectedCity.set(this.transferForm.get('city')?.value || '');
  }

  ngOnInit() {
    if (this.initialData()) {
      const d = this.initialData();
      this.transferForm.patchValue({
        city: d.city,
        date: d.date,
        transfer: d.transfer_id,
        from: d.from,
        to: d.to,
        tot: d.tot,
        pickupTime: d.pickup,
        price: d.price,
        remarks: d.remarks
      });
      this.selectedCity.set(d.city);
    }
  }

  getPrice() {
    this.transferForm.patchValue({ price: 2500 });
  }

  onSave() {
    if (this.transferForm.valid) {
      const transferId = this.transferForm.get('transfer')?.value;
      const transferObj = this.masterData.transfers().find(t => t.id == transferId);
      const data = this.transferForm.getRawValue();
      data.transfer_name = transferObj ? transferObj.transfer_type : '';
      data.transfer_id = transferId;
      this.save.emit(data);
    } else {
      this.transferForm.markAllAsTouched();
    }
  }
}
