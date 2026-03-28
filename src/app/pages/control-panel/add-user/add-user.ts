import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslationService } from '../../../core/services/translation.service';
import { UserApiService } from '../../../core/services/api/user-api.service';

@Component({
  selector: 'app-add-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-user.html',
  styleUrl: './add-user.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddUserComponent implements OnInit {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private translationService = inject(TranslationService);
  private userApiService = inject(UserApiService);
  private route = inject(ActivatedRoute);
  public t = this.translationService.translations;

  userId = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  userForm = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['', Validators.required],
    agent: ['', Validators.required],
    password: [''],
    confirmPassword: ['']
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userId.set(id);
      this.userApiService.getUser(id).subscribe(user => {
        this.userForm.patchValue({
          username: user.username,
          email: user.email,
          role: user.role,
          agent: user.agent_id
        });
        // Remove password requirement when editing
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
      });
    } else {
      // Set validators if creating
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

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
      const userData: any = {
        username: this.userForm.value.username,
        email: this.userForm.value.email,
        role: this.userForm.value.role,
        agent_id: this.userForm.value.agent
      };

      if (this.userForm.value.password) {
        userData.password = this.userForm.value.password;
      }

      const request = this.userId()
        ? this.userApiService.updateUser(this.userId()!, userData)
        : this.userApiService.createUser(userData);

      request.subscribe({
        next: () => {
          this.goBack();
        },
        error: (err: any) => {
          console.error('Error saving user:', err);
          alert('Failed to save user');
        }
      });
    } else {
      this.userForm.markAllAsTouched();
    }
  }
}
