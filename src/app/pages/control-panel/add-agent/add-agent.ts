import { Component, ChangeDetectionStrategy, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-add-agent',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-agent.html',
  styleUrl: './add-agent.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddAgentComponent implements OnInit {
  public location = inject(Location);
  public translationService = inject(TranslationService);
  public t = this.translationService.translations;
  private fb = inject(FormBuilder);
  private router = inject(Router);

  agentForm = this.fb.group({
    name: ['', Validators.required],
    markup: ['', Validators.required],
    address: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', Validators.required],
    fax: [''],
    deadlineType: ['', Validators.required],
    customDays: [null as number | null]
  });

  ngOnInit() {
    this.agentForm.get('deadlineType')?.valueChanges.subscribe(val => {
      const customCtrl = this.agentForm.get('customDays');
      if (val === 'custom') {
        customCtrl?.setValidators([Validators.required, Validators.min(1), Validators.max(365)]);
      } else {
        customCtrl?.clearValidators();
        customCtrl?.setValue(null);
      }
      customCtrl?.updateValueAndValidity();
    });
  }

  saveAgent() {
    if (this.agentForm.invalid) {
      this.agentForm.markAllAsTouched();
      return;
    }
    console.log('Saving Agent:', this.agentForm.value);
    alert('Agent Saved Successfully! (Demo)');
    this.location.back();
  }
}
