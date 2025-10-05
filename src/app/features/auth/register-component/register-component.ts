import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register-component',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-component.html',
  styleUrl: './register-component.scss',
})
export class RegisterComponent {
  private formBuilder = inject(FormBuilder);

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

  onSubmit() {}
}
