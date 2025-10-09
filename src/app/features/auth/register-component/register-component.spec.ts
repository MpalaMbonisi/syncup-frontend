import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register-component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // Create a spy object for AuthService
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }, provideRouter([])],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display registration form title', () => {
    const compiled = fixture.nativeElement;
    const heading = compiled.querySelector('h2');
    expect(heading).toBeTruthy();
    expect(heading.textContent).toContain('Create Account');
  });

  it('should have all required form fields including confirm password', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('#firstName')).toBeTruthy();
    expect(compiled.querySelector('#lastName')).toBeTruthy();
    expect(compiled.querySelector('#username')).toBeTruthy();
    expect(compiled.querySelector('#email')).toBeTruthy();
    expect(compiled.querySelector('#password')).toBeTruthy();
    expect(compiled.querySelector('#confirmPassword')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should initialize form with empty values', () => {
    expect(component.registerForm.get('firstName')?.value).toBe('');
    expect(component.registerForm.get('lastName')?.value).toBe('');
    expect(component.registerForm.get('username')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
    expect(component.registerForm.get('password')?.value).toBe('');
    expect(component.registerForm.get('confirmPassword')?.value).toBe('');
  });

  it('should mark form as invalid when fields are empty', () => {
    expect(component.registerForm.valid).toBeFalse();
  });

  it('should mark form as valid when all fields are correctly filled', () => {
    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john.doe@yahoo.com',
      password: 'StrongPassword1234',
      confirmPassword: 'StrongPassword1234',
    });
    expect(component.registerForm.valid).toBeTrue();
  });

  it('should show error when passwords do not match', () => {
    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john.doe@yahoo.com',
      password: 'StrongPassword1234',
      confirmPassword: 'DifferentPassword1234',
    });

    component.registerForm.get('confirmPassword')?.markAsTouched();
    fixture.detectChanges;

    expect(component.registerForm.errors?.['passwordMismatch']).toBeTrue();
    expect(component.registerForm.valid).toBeFalse();
  });

  it('should show error messages for invalid fields when touched', () => {
    const firstNameControl = component.registerForm.get('firstName');
    const compiled = fixture.nativeElement;

    // Mark as touched to trigger error display
    firstNameControl?.markAsTouched();
    fixture.detectChanges();

    const errorMessage = compiled.querySelector('.error-message');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toContain('First name is required');
  });

  it('should disable submit button when form is invalid', () => {
    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('button[type="submit"]');

    expect(submitButton.disabled).toBeTrue();
  });

  it('should disable submit button when form is invalid', () => {
    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('button[type="submit"]');

    expect(submitButton.disabled).toBeTrue();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();

    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();

    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalse();
  });

  it('should toggle confirm password visibility', () => {
    expect(component.showConfirmPassword).toBeFalse();

    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword).toBeTrue();

    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword).toBeFalse();
  });

  it('should change password input type when toggling visibility', () => {
    const compiled = fixture.nativeElement;
    const passwordInput = compiled.querySelector('#password');

    expect(passwordInput.type).toBe('password');

    component.togglePasswordVisibility();
    fixture.detectChanges();

    expect(passwordInput.type).toBe('text');
  });

  it('should change confirm password input type when toggling visibility', () => {
    const compiled = fixture.nativeElement;
    const confirmPasswordInput = compiled.querySelector('#confirmPassword');

    expect(confirmPasswordInput.type).toBe('password');

    component.toggleConfirmPasswordVisibility();
    fixture.detectChanges();

    expect(confirmPasswordInput.type).toBe('text');
  });

  it('should display password visibility toggle buttons', () => {
    const compiled = fixture.nativeElement;
    const toggleButtons = compiled.querySelectorAll('.toggle-password');

    expect(toggleButtons.length).toBe(2);
  });

  it('should call onSubmit when form is submitted with valid data', () => {
    spyOn(component, 'onSubmit');

    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@yahoo.com',
      password: 'StrongPassword1234',
      confirmPassword: 'StrongPassword1234',
    });

    const compiled = fixture.nativeElement;
    const form = compiled.querySelector('form');
    form.dispatchEvent(new Event('submit'));

    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should not include confirmPassword in registration payload', () => {
    authService.register.and.returnValue(of({ message: 'User registered successfully' }));

    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@yahoo.com',
      password: 'StrongPassword1234',
      confirmPassword: 'StrongPassword1234',
    });

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@yahoo.com',
      password: 'StrongPassword1234',
    });
  });

  it('should display success message on successful registration', () => {
    authService.register.and.returnValue(of({ message: 'User registered successfully!' }));

    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@yahoo.com',
      password: 'StrongPassword1234',
      confirmPassword: 'StrongPassword1234',
    });

    component.onSubmit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const successMessage = compiled.querySelector('.success-message');

    expect(successMessage).toBeTruthy();
    expect(successMessage.textContent).toContain('Registration successful');
  });

  it('should display error message when registration fails', () => {
    authService.register.and.returnValue(
      throwError(() => ({ error: { message: ['Username already exists'] } }))
    );

    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'johndoe@yahoo.com',
      password: 'StrongPassword1234',
      confirmPassword: 'StrongPassword1234',
    });

    component.onSubmit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const errorMessage = compiled.querySelector('.error-message-box');

    expect(errorMessage).toBeTruthy();
    expect(component.errorMessage).toBeTruthy();
  });
});
