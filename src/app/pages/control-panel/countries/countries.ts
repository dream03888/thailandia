import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CountryApiService } from '../../../core/services/api/country-api.service';
import { MasterDataService } from '../../../core/services/master-data.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-countries',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './countries.html',
  styleUrl: './countries.css'
})
export class CountriesComponent implements OnInit {
  private countryApi = inject(CountryApiService);
  private masterData = inject(MasterDataService);
  private translationService = inject(TranslationService);
  private fb = inject(FormBuilder);

  public t = this.translationService.translations;
  countries = this.masterData.countries;
  
  countryForm: FormGroup;
  editId = signal<number | null>(null);
  isSaving = signal(false);

  constructor() {
    this.countryForm = this.fb.group({
      name: ['', Validators.required],
      code: ['']
    });
  }

  ngOnInit() {
    this.masterData.refresh().subscribe();
  }

  onEdit(country: any) {
    this.editId.set(country.id);
    this.countryForm.patchValue({
      name: country.name,
      code: country.code
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onDelete(id: number) {
    if (confirm('Are you sure you want to delete this country?')) {
      this.countryApi.deleteCountry(id).subscribe(() => {
        this.masterData.refresh().subscribe();
      });
    }
  }

  onSubmit() {
    if (this.countryForm.invalid) return;
    this.isSaving.set(true);
    const data = this.countryForm.value;
    const id = this.editId();

    const obs = id 
      ? this.countryApi.updateCountry(id, data)
      : this.countryApi.addCountry(data);

    obs.subscribe({
      next: () => {
        this.resetForm();
        this.masterData.refresh().subscribe();
      },
      error: () => this.isSaving.set(false),
      complete: () => this.isSaving.set(false)
    });
  }

  resetForm() {
    this.editId.set(null);
    this.countryForm.reset();
  }
}
