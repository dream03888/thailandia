import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { SupplierApiService } from '../../../core/services/api/supplier-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ActivatedRoute } from '@angular/router';
import { MasterDataService } from '../../../core/services/master-data.service';

@Component({
  selector: 'app-add-supplier',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-supplier.html',
  styleUrl: './add-supplier.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddSupplierComponent implements OnInit {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private translationService = inject(TranslationService);
  private supplierApiService = inject(SupplierApiService);
  public authService = inject(AuthService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);
  private masterData = inject(MasterDataService);
  public t = this.translationService.translations;
  public countries = this.masterData.countries;
  viewOnly = signal(false);

  supplierForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    country: ['Thailand', Validators.required],
    location: ['', Validators.required],
    description: [''],
    // Service Types
    serviceTransfers: [false],
    serviceExcursions: [false],
    serviceTours: [false],
    // Policy
    cancellationDays: [3, [Validators.required, Validators.min(-1)]],
    paymentDays: [1, [Validators.required, Validators.min(0)]]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const mode = this.route.snapshot.queryParamMap.get('mode');

    const pageId = 'cp_suppliers';
    const hasAddPerm = this.authService.canAdd(pageId);
    const hasEditPerm = this.authService.canEdit(pageId);

    if (mode === 'view' || (id && !hasEditPerm)) {
      this.viewOnly.set(true);
      this.supplierForm.disable();
    }

    if (!id && !hasAddPerm) {
      this.toastService.error('You do not have permission to add new suppliers');
      this.goBack();
      return;
    }
  }

  policyPreview = computed(() => {
    const cancel = this.supplierForm.get('cancellationDays')?.value as number;
    const payment = this.supplierForm.get('paymentDays')?.value as number;
    
    let cancelText = '';
    if (cancel === -1) {
      cancelText = 'No cancellation allowed.';
    } else {
      cancelText = `Cancellation allowed until ${cancel} days before travel.`;
    }
    
    let paymentText = '';
    if (payment === 0) {
      paymentText = 'Payment due on travel date.';
    } else {
      paymentText = `Payment due ${payment} day${payment > 1 ? 's' : ''} before travel.`;
    }
    
    return `Cancellation: ${cancelText} | Payment: ${paymentText}`;
  });

  goBack() {
    this.location.back();
  }

  saveSupplier() {
    if (this.supplierForm.valid) {
      const supplierData = {
        name: this.supplierForm.value.name,
        email: this.supplierForm.value.email,
        phone: this.supplierForm.value.phone,
        services: [
          ...(this.supplierForm.value.serviceTransfers ? ['Transfers'] : []),
          ...(this.supplierForm.value.serviceExcursions ? ['Excursions'] : []),
          ...(this.supplierForm.value.serviceTours ? ['Tours'] : [])
        ],
        description: this.supplierForm.value.description
      };

      this.supplierApiService.createSupplier(supplierData).subscribe({
        next: () => {
          this.goBack();
        },
        error: (err: any) => {
          console.error('Error creating supplier:', err);
          alert('Failed to create supplier');
        }
      });
    } else {
      this.supplierForm.markAllAsTouched();
    }
  }
}
