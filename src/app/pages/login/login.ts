import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslationService } from '../../core/services/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  public translationService = inject(TranslationService);
  private router = inject(Router);

  public t = this.translationService.translations;

  onSubmit(event: Event) {
    event.preventDefault();
    this.router.navigate(['/home']);
  }
}
