import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register-component';
// import { AuthService } from '../../../core/services/auth-service';
import { ReactiveFormsModule } from '@angular/forms';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  // let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    // Create a spy object for AuthService
    // const authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      // providers: [{provide: AuthService, useValue: authServiceSpy}]
    }).compileComponents();

    // authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Test #1
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test #2
  it('should display registration form title', () => {
    const compiled = fixture.nativeElement;
    const heading = compiled.querySelector('h2');
    expect(heading).toBeTruthy();
    expect(heading.textContent).toContain('Create Account');
  });

  // Test #3
  it('should have all required form fields', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('#firstName')).toBeTruthy();
    expect(compiled.querySelector('#lastName')).toBeTruthy();
    expect(compiled.querySelector('#username')).toBeTruthy();
    expect(compiled.querySelector('#email')).toBeTruthy();
    expect(compiled.querySelector('#password')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
  });

  // Test #4
  it('should initialize form with empty values', () => {
    expect(component.registerForm.get('firstName')?.value).toBe('');
    expect(component.registerForm.get('lastName')?.value).toBe('');
    expect(component.registerForm.get('username')?.value).toBe('');
    expect(component.registerForm.get('email')?.value).toBe('');
  });

  // Test # 5
  it('should mark form as invalid when fields are empty', () => {
    expect(component.registerForm.valid).toBeFalse();
  });

  // Test #6
  it('should mark form as valid when all fields are correctly filled', () => {
    component.registerForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john.doe@yahoo.com',
      password: 'StrongPassword1234',
    });
    expect(component.registerForm.valid).toBeTrue();
  });

  // Test #7
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

  // Test #8
  it('should disable submit button when form is invalid', () => {
    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('button[type="submit"]');

    expect(submitButton.disabled).toBeTrue();
  });
});
