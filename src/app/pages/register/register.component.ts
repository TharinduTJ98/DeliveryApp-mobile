import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService, getAuthErrorMessage } from '../../core/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  imports: [FormsModule, RouterLink],
})
export class RegisterComponent {
  private readonly authService = inject(AuthService);

  readonly countries = [
    { code: 'IN', name: 'India', dialCode: '+91' },
    { code: 'US', name: 'United States', dialCode: '+1' },
    { code: 'CA', name: 'Canada', dialCode: '+1' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44' },
    { code: 'AU', name: 'Australia', dialCode: '+61' },
    { code: 'AE', name: 'United Arab Emirates', dialCode: '+971' },
    { code: 'DE', name: 'Germany', dialCode: '+49' },
    { code: 'FR', name: 'France', dialCode: '+33' },
    { code: 'SG', name: 'Singapore', dialCode: '+65' },
  ];
  showPassword = false;
  isSubmitting = false;
  statusMessage = '';
  fullName = '';
  email = '';
  selectedCountry = 'IN';
  mobileNumber = '';
  password = '';
  confirmPassword = '';

  get selectedDialCode(): string {
    return this.countries.find((country) => country.code === this.selectedCountry)?.dialCode ?? '';
  }

  get passwordStrength(): number {
    let strength = 0;
    if (this.password.length >= 8) strength += 1;
    if (/[A-Z]/.test(this.password) && /[a-z]/.test(this.password)) strength += 1;
    if (/\d/.test(this.password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(this.password)) strength += 1;
    return strength;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.statusMessage = 'Please complete all fields and accept the terms to continue.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.statusMessage = 'Your passwords do not match.';
      return;
    }

    this.isSubmitting = true;
    this.statusMessage = '';
    this.authService
      .register({
        fullName: this.fullName,
        email: this.email,
        mobile: `${this.selectedDialCode}${this.mobileNumber}`,
        password: this.password,
        role: 0,
      })
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.statusMessage = 'Your account has been created. You can now sign in.';
        },
        error: (error: unknown) => {
          this.statusMessage = getAuthErrorMessage(error, 'Unable to create your account. Please try again.');
        },
      });
  }
}
