import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FooterComponent } from '../../../shared/components/footer-component/footer-component';

@Component({
  selector: 'app-login-component',
  imports: [CommonModule, ReactiveFormsModule, FooterComponent],
  templateUrl: './login-component.html',
  styleUrl: './login-component.scss',
})
export class LoginComponent {
  private formBuilder = inject(FormBuilder);

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

  onSubmit() {}
}
