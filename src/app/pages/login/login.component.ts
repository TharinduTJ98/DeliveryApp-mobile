import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService, getAuthErrorMessage } from '../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [FormsModule, RouterLink],
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  showPassword = false;
  rememberMe = true;
  isSubmitting = false;
  statusMessage = '';
  email = '';
  password = '';

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.statusMessage = 'Please enter a valid email address and password.';
      return;
    }

    this.isSubmitting = true;
    this.statusMessage = '';
    this.authService
      .login({ email: this.email, password: this.password }, this.rememberMe)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => void this.router.navigate(['/home']),
        error: (error: unknown) => {
          this.statusMessage = getAuthErrorMessage(error, 'Unable to sign in. Please try again.');
        },
      });
  }
}
