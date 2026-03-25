import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-user.html',
  styleUrl: './add-user.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddUserComponent {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private translationService = inject(TranslationService);
  public t = this.translationService.translations;

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  userForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['', Validators.required],
    agent: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  goBack() {
    this.location.back();
  }

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update(v => !v);
  }

  saveUser() {
    if (this.userForm.valid) {
      console.log('User Data:', this.userForm.value);
      this.goBack();
    } else {
      this.userForm.markAllAsTouched();
    }
  }
}
