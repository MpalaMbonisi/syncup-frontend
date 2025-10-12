import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FooterComponent } from '../../../shared/components/footer-component/footer-component';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-login-component',
  imports: [CommonModule, ReactiveFormsModule, FooterComponent],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})
export class LoginComponent {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  // private router = inject(Router);

  loginForm: FormGroup;
  errorMessage: string = '';
  showPassword: boolean = false;

  constructor() {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage = '';

      this.authService.login(this.loginForm.value).subscribe({
        next: response => {
          // store token in localStorage
          localStorage.setItem('token', response.token);
          // navigate to home
          // this.router.nagivate(['/home']);
        },
        error: error => {
          if (error.error && error.error.message) {
            this.errorMessage = Array.isArray(error.error.message)
              ? error.error.message.join(', ')
              : error.error.message;
          } else {
            this.errorMessage = 'Login failed. Please check your credentials.';
          }
        },
      });
    }
  }
}
