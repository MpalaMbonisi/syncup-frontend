import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { FooterComponent } from '../../../shared/components/footer-component/footer-component';
import {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION,
} from '../../../core/constants/app.constants';

@Component({
  selector: 'app-register-component',
  imports: [ReactiveFormsModule, RouterLink, FooterComponent],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss',
})
export class RegisterComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);

  registerForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  isLoading: boolean = false;

  constructor() {
    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(VALIDATION.PASSWORD_MIN_LENGTH)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.successMessage = '';
      this.errorMessage = '';
      this.isLoading = true;

      const userData = { ...this.registerForm.value };
      delete userData.confirmPassword;

      this.authService.register(userData).subscribe({
        next: response => {
          console.log(response.message);
          this.isLoading = false;
          this.successMessage = SUCCESS_MESSAGES.REGISTRATION_SUCCESS;
          this.registerForm.reset();
        },
        error: error => {
          this.isLoading = false; // Reset loading state on error
          if (error.error && error.error.message) {
            this.errorMessage = Array.isArray(error.error.message)
              ? error.error.message.join(', ')
              : error.error.message;
          } else {
            this.errorMessage = ERROR_MESSAGES.REGISTRATION_FAILED;
          }
        },
      });
    }
  }
}
