import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TransferApiService } from '../../../core/services/api/transfer-api.service';
import { SupplierApiService } from '../../../core/services/api/supplier-api.service';
import { AddTransferPriceModalComponent } from '../../../core/components/modals/add-transfer-price-modal/add-transfer-price-modal';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-add-transfer',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AddTransferPriceModalComponent],
  templateUrl: './add-transfer.html',
  styleUrl: './add-transfer.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddTransferComponent implements OnInit {
  private translationService = inject(TranslationService);
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private transferApiService = inject(TransferApiService);
  private supplierApiService = inject(SupplierApiService);
  public authService = inject(AuthService);
  private toastService = inject(ToastService);
  public t = this.translationService.translations;
  viewOnly = signal(false);

  // Edit mode
  editTransferId = signal<number | null>(null);
  isEditMode = computed(() => this.editTransferId() !== null);

  // DB data
  suppliersList = signal<any[]>([]);

  // Cities — static list matching the DB currencies table
  readonly cities = [
    'Bangkok', 'Phuket', 'Chiang Mai', 'Koh Tao', 'Krabi', 'Koh Kood',
    'Koh Samui', 'Ayutthaya', 'Pattaya', 'Koh Phangan', 'Kanchanaburi',
    'Chiang Saen', 'Hua Hin', 'Koh Samed', 'Koh Chang', 'Amphawa',
    'Phi Phi Island', 'Koh Yao Noi', 'Koh Lipe', 'Rayong', 'Khao Lak',
    'Koh Lanta', 'Chiang Rai', 'Pai', 'Ubon Ratchathani', 'Surin',
    'Koh Kradan', 'Khao Yai', 'Mae Hong Son'
  ];

  transferForm = this.fb.group({
    transfer_type: ['', Validators.required],
    country: ['Thailand', Validators.required],
    city: ['', Validators.required],
    supplier_id: [''],
    description: ['', Validators.required],
    departure: ['', Validators.required],
    arrival: ['', Validators.required],
    sic_price_adult: [0, [Validators.required, Validators.min(0)]],
    sic_price_child: [0, [Validators.required, Validators.min(0)]],
  });

  transferPrices = signal<any[]>([]);
  isPriceModalOpen = signal(false);
  editingPriceId = signal<number | null>(null);

  selectedPrice = computed(() => {
    const id = this.editingPriceId();
    if (id === null) return null;
    return this.transferPrices().find(p => p.id === id);
  });

  // Grouped prices for display
  groupedPrices = computed(() => {
    const map = new Map<string, any>();
    this.transferPrices().forEach((p, index) => {
      const key = `${p.dateFrom}_${p.dateTo}`;
      if (!map.has(key)) {
        map.set(key, {
          dateFrom: p.dateFrom,
          dateTo: p.dateTo,
          items: []
        });
      }
      map.get(key).items.push({ ...p, originalIndex: index });
    });
    // Sort items by pax ASC inside each group
    const groups = Array.from(map.values());
    groups.forEach(g => {
      g.items.sort((a: any, b: any) => a.pax - b.pax);
    });
    return groups;
  });

  expandedGroups = signal<Record<string, boolean>>({});

  toggleGroup(key: string) {
    this.expandedGroups.update(state => ({
      ...state,
      [key]: !state[key]
    }));
  }

  // Duplicate date modal
  isDuplicateModalOpen = signal(false);
  duplicatingId = signal<number | null>(null);
  duplicateDateFrom = signal('');
  duplicateDateTo = signal('');
  duplicatePriceValue = signal<number | null>(null);


  ngOnInit() {
    this.loadSuppliers();
    const id = this.route.snapshot.paramMap.get('id');
    const mode = this.route.snapshot.queryParamMap.get('mode');

    const pageId = 'cp_transfers';
    const hasAddPerm = this.authService.canAdd(pageId);
    const hasEditPerm = this.authService.canEdit(pageId);

    if (mode === 'view' || (id && !hasEditPerm)) {
      this.viewOnly.set(true);
      this.transferForm.disable();
    }

    if (!id && !hasAddPerm) {
      this.toastService.error('You do not have permission to add new transfers');
      this.goBack();
      return;
    }

    if (id) {
      this.editTransferId.set(Number(id));
      this.loadTransferForEdit(Number(id));
    }
  }

  loadSuppliers() {
    this.supplierApiService.listSuppliers().subscribe(data => this.suppliersList.set(data));
  }

  loadTransferForEdit(id: number) {
    this.transferApiService.getTransfer(id).subscribe((transfer: any) => {
      console.log('[AddTransfer] Loaded Data:', transfer); // Debug log เพื่อเช็คค่าที่มาจาก API

      this.transferForm.patchValue({
        transfer_type: transfer.transfer_type || '',
        country: 'Thailand',
        city: transfer.city || '',
        supplier_id: transfer.supplier_id ? String(transfer.supplier_id) : '',
        description: transfer.description || '',
        departure: transfer.departure || '',
        arrival: transfer.arrival || '',
        // ดึงแบบยืดหยุ่น (รองรับทั้ง snake_case และ camelCase)
        sic_price_adult: transfer.sic_price_adult ?? transfer.sicPriceAdult ?? 0,
        sic_price_child: transfer.sic_price_child ?? transfer.sicPriceChild ?? 0,
      });

      // Populate pricing from DB
      if (transfer.pricing && Array.isArray(transfer.pricing)) {
        const prices = transfer.pricing.map((p: any) => ({
          id: p.id || Date.now(),
          dateFrom: p.start_date,
          dateTo: p.end_date,
          pax: p.pax,
          price: p.price,
          cost: p.cost
        }));
        this.transferPrices.set(prices);
      }
    });
  }

  openAddPriceModal() {
    this.editingPriceId.set(null);
    this.isPriceModalOpen.set(true);
  }

  editPrice(priceRow: any) {
    this.editingPriceId.set(priceRow.id);
    this.isPriceModalOpen.set(true);
  }

  handlePriceSave(priceData: any) {
    const editingId = this.editingPriceId();
    if (editingId !== null) {
      this.transferPrices.update(prices => prices.map(p => p.id === editingId ? { ...priceData, id: editingId } : p));
    } else {
      this.transferPrices.update(prices => [...prices, { ...priceData, id: Date.now() }]);
    }
    this.isPriceModalOpen.set(false);
    this.editingPriceId.set(null);
  }

  removePrice(id: number) {
    this.transferPrices.update(prices => prices.filter(p => p.id !== id));
  }

  duplicatePrice(priceRow: any) {
    this.duplicatingId.set(priceRow.id);
    this.duplicateDateFrom.set(priceRow.dateFrom ?? '');
    this.duplicateDateTo.set(priceRow.dateTo ?? '');
    this.duplicatePriceValue.set(priceRow.price ?? 0);
    this.isDuplicateModalOpen.set(true);
  }

  confirmDuplicate() {
    const id = this.duplicatingId();
    if (id === null) return;
    this.transferPrices.update(prices => {
      const index = prices.findIndex(p => p.id === id);
      if (index === -1) return prices;
      const item = prices[index];
      const duplicated = {
        ...item,
        id: Date.now() + Math.random(),
        dateFrom: this.duplicateDateFrom(),
        dateTo: this.duplicateDateTo(),
        price: this.duplicatePriceValue() ?? item.price 
      };
      const newList = [...prices];
      newList.splice(index + 1, 0, duplicated);
      return newList;
    });
    this.cancelDuplicate();
  }

  cancelDuplicate() {
    this.isDuplicateModalOpen.set(false);
    this.duplicatingId.set(null);
    this.duplicateDateFrom.set('');
    this.duplicateDateTo.set('');
    this.duplicatePriceValue.set(null);
  }

  isFieldInvalid(controlName: string): boolean {
    const control = this.transferForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  goBack() {
    this.location.back();
  }

  onSubmit() {
    if (this.transferForm.valid) {
      const formValue = this.transferForm.value as any;
      const payload = {
        transfer_type: formValue.transfer_type,
        city: formValue.city,
        supplier_id: formValue.supplier_id || null,
        description: formValue.description,
        departure: formValue.departure,
        arrival: formValue.arrival,
        sic_price_adult: formValue.sic_price_adult,
        sic_price_child: formValue.sic_price_child,
        pricing: this.transferPrices().map(p => ({
          start_date: p.dateFrom,
          end_date: p.dateTo,
          pax: p.pax,
          price: p.price,
          cost: p.cost || 0,
          currency_id: 4
        }))
      };

      const id = this.editTransferId();
      const request$ = id
        ? this.transferApiService.updateTransfer(id, payload)
        : this.transferApiService.createTransfer(payload);

      request$.subscribe({
        next: () => {
          alert(id ? 'Transfer updated successfully!' : 'Transfer saved successfully!');
          this.goBack();
        },
        error: (err) => {
          console.error('Error saving transfer:', err);
          alert('Error saving transfer: ' + (err.error?.message || err.message));
        }
      });
    } else {
      this.transferForm.markAllAsTouched();
    }
  }
}
