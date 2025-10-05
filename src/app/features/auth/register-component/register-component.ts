import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-register-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss',
})
export class RegisterComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);

  registerForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  constructor() {
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.successMessage = '';
      this.errorMessage = '';

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.successMessage = 'Registration successful! You can now log in.';
          this.registerForm.reset();
        },
        error: error => {
          if (error.error && error.error.message) {
            this.errorMessage = Array.isArray(error.error.message)
              ? error.error.message.join(', ')
              : error.error.message;
          } else {
            this.errorMessage = 'Registration failed. Please try again.';
          }
        },
      });
    }
  }
}
