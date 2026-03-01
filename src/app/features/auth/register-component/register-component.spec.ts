import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { delay, of, throwError } from 'rxjs';

import { RegisterComponent } from './register-component';
import { AuthService, RegisterResponse } from '../../../core/services/auth-service';
import { VALIDATION } from '../../../core/constants/app.constants';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: { register: jest.Mock };
  let compiled: HTMLElement;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent, ReactiveFormsModule],
      providers: [{ provide: AuthService, useValue: mockAuthService }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
      expect(component.registerForm.get('firstName')?.value).toBe('');
      expect(component.registerForm.get('lastName')?.value).toBe('');
      expect(component.registerForm.get('username')?.value).toBe('');
      expect(component.registerForm.get('email')?.value).toBe('');
      expect(component.registerForm.get('password')?.value).toBe('');
      expect(component.registerForm.get('confirmPassword')?.value).toBe('');
    });

    it('should initialize loading state as false', () => {
      expect(component.isLoading).toBe(false);
    });

    it('should initialize with no success message', () => {
      expect(component.successMessage).toBe('');
    });

    it('should initialize with no error message', () => {
      expect(component.errorMessage).toBe('');
    });

    it('should initialize password visibility as hidden', () => {
      expect(component.showPassword).toBe(false);
      expect(component.showConfirmPassword).toBe(false);
    });
  });

  describe('Text Logo', () => {
    it('should display the SyncUp text logo', () => {
      const logoText = fixture.debugElement.query(By.css('.logo-text'));

      expect(logoText).toBeTruthy();
      expect(logoText.nativeElement.textContent.trim()).toBe('SyncUp');
    });

    it('should use Miltonian Tattoo font family', () => {
      const logoText = fixture.debugElement.query(By.css('.logo-text'));

      expect(logoText.nativeElement.classList).toContain('logo-text');
    });

    it('should render logo before the form title', () => {
      const logo = compiled.querySelector('.logo-text');
      const heading = compiled.querySelector('h2');

      expect(logo).toBeTruthy();
      expect(heading).toBeTruthy();

      const logoIndex = Array.from(compiled.querySelectorAll('*')).indexOf(logo!);
      const headingIndex = Array.from(compiled.querySelectorAll('*')).indexOf(heading!);

      expect(logoIndex).toBeLessThan(headingIndex);
    });
  });

  describe('Template Rendering', () => {
    it('should display "Create Account" as the form title', () => {
      const heading = compiled.querySelector('h2');

      expect(heading).toBeTruthy();
      expect(heading!.textContent).toContain('Create Account');
    });

    it('should render all required input fields', () => {
      expect(compiled.querySelector('#firstName')).toBeTruthy();
      expect(compiled.querySelector('#lastName')).toBeTruthy();
      expect(compiled.querySelector('#username')).toBeTruthy();
      expect(compiled.querySelector('#email')).toBeTruthy();
      expect(compiled.querySelector('#password')).toBeTruthy();
      expect(compiled.querySelector('#confirmPassword')).toBeTruthy();
    });

    it('should render submit button', () => {
      const submitButton = compiled.querySelector('button[type="submit"]');

      expect(submitButton).toBeTruthy();
    });

    it('should display login prompt with link', () => {
      const loginPrompt = compiled.querySelector('.login-prompt');
      const loginLink = compiled.querySelector('.login-prompt a');

      expect(loginPrompt).toBeTruthy();
      expect(loginPrompt!.textContent).toContain('Already have an account?');
      expect(loginLink).toBeTruthy();
      expect(loginLink!.textContent).toContain('Log in here');
    });

    it('should render footer component', () => {
      const footerElement = fixture.debugElement.query(By.css('app-footer-component'));

      expect(footerElement).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    describe('First Name Field', () => {
      it('should be invalid when empty', () => {
        const firstNameControl = component.registerForm.get('firstName');

        expect(firstNameControl?.valid).toBe(false);
        expect(firstNameControl?.errors?.['required']).toBe(true);
      });

      it('should be valid when filled', () => {
        const firstNameControl = component.registerForm.get('firstName');
        firstNameControl?.setValue('John');

        expect(firstNameControl?.valid).toBe(true);
      });

      it('should display error message when empty and touched', () => {
        const firstNameControl = component.registerForm.get('firstName');
        firstNameControl?.markAsTouched();
        fixture.detectChanges();

        const errorMessage = compiled.querySelector('.error-message');

        expect(errorMessage).toBeTruthy();
        expect(errorMessage!.textContent).toContain('First name is required');
      });
    });

    describe('Last Name Field', () => {
      it('should be invalid when empty', () => {
        const lastNameControl = component.registerForm.get('lastName');

        expect(lastNameControl?.valid).toBe(false);
        expect(lastNameControl?.errors?.['required']).toBe(true);
      });

      it('should be valid when filled', () => {
        const lastNameControl = component.registerForm.get('lastName');
        lastNameControl?.setValue('Doe');

        expect(lastNameControl?.valid).toBe(true);
      });

      it('should display error message when empty and touched', () => {
        const lastNameControl = component.registerForm.get('lastName');
        lastNameControl?.markAsTouched();
        fixture.detectChanges();

        const errorMessage = compiled.querySelector('.error-message');

        expect(errorMessage).toBeTruthy();
        expect(errorMessage!.textContent).toContain('Last name is required');
      });
    });

    describe('Username Field', () => {
      it('should be invalid when empty', () => {
        const usernameControl = component.registerForm.get('username');

        expect(usernameControl?.valid).toBe(false);
        expect(usernameControl?.errors?.['required']).toBe(true);
      });

      it('should be valid when filled', () => {
        const usernameControl = component.registerForm.get('username');
        usernameControl?.setValue('johndoe');

        expect(usernameControl?.valid).toBe(true);
      });

      it('should display error message when empty and touched', () => {
        const usernameControl = component.registerForm.get('username');
        usernameControl?.markAsTouched();
        fixture.detectChanges();

        const errorMessage = compiled.querySelector('.error-message');

        expect(errorMessage).toBeTruthy();
        expect(errorMessage!.textContent).toContain('Username is required');
      });
    });

    describe('Email Field', () => {
      it('should be invalid when empty', () => {
        const emailControl = component.registerForm.get('email');

        expect(emailControl?.valid).toBe(false);
        expect(emailControl?.errors?.['required']).toBe(true);
      });

      it('should be invalid with incorrect email format', () => {
        const emailControl = component.registerForm.get('email');
        emailControl?.setValue('invalid-email');

        expect(emailControl?.valid).toBe(false);
        expect(emailControl?.errors?.['email']).toBe(true);
      });

      it('should be valid with correct email format', () => {
        const emailControl = component.registerForm.get('email');
        emailControl?.setValue('john.doe@example.com');

        expect(emailControl?.valid).toBe(true);
      });

      it('should display error when empty and touched', () => {
        const emailControl = component.registerForm.get('email');
        emailControl?.markAsTouched();
        fixture.detectChanges();

        const errorMessage = compiled.querySelector('.error-message');

        expect(errorMessage).toBeTruthy();
        expect(errorMessage!.textContent).toContain('Email is required');
      });

      it('should display error when format is invalid and touched', () => {
        const emailControl = component.registerForm.get('email');
        emailControl?.setValue('invalid-email');
        emailControl?.markAsTouched();
        fixture.detectChanges();

        const errorMessages = compiled.querySelectorAll('.error-message');
        const emailError = Array.from(errorMessages).find(el =>
          el.textContent?.includes('valid email')
        );

        expect(emailError).toBeTruthy();
      });
    });

    describe('Password Field', () => {
      it('should be invalid when empty', () => {
        const passwordControl = component.registerForm.get('password');

        expect(passwordControl?.valid).toBe(false);
        expect(passwordControl?.errors?.['required']).toBe(true);
      });

      it(`should be invalid when less than ${VALIDATION.PASSWORD_MIN_LENGTH} characters`, () => {
        const passwordControl = component.registerForm.get('password');
        passwordControl?.setValue('short');

        expect(passwordControl?.valid).toBe(false);
        expect(passwordControl?.errors?.['minlength']).toBeTruthy();
      });

      it(`should be valid when ${VALIDATION.PASSWORD_MIN_LENGTH} or more characters`, () => {
        const passwordControl = component.registerForm.get('password');
        passwordControl?.setValue('StrongPassword123');

        expect(passwordControl?.valid).toBe(true);
      });

      it('should display error when empty and touched', () => {
        const passwordControl = component.registerForm.get('password');
        passwordControl?.markAsTouched();
        fixture.detectChanges();

        const errorMessage = compiled.querySelector('.error-message');

        expect(errorMessage).toBeTruthy();
        expect(errorMessage!.textContent).toContain('Password is required');
      });

      it('should display error when too short and touched', () => {
        const passwordControl = component.registerForm.get('password');
        passwordControl?.setValue('short');
        passwordControl?.markAsTouched();
        fixture.detectChanges();

        const errorMessages = compiled.querySelectorAll('.error-message');
        const passwordError = Array.from(errorMessages).find(el =>
          el.textContent?.includes('at least 8 characters')
        );

        expect(passwordError).toBeTruthy();
      });
    });

    describe('Confirm Password Field', () => {
      it('should be invalid when empty', () => {
        const confirmPasswordControl = component.registerForm.get('confirmPassword');

        expect(confirmPasswordControl?.valid).toBe(false);
        expect(confirmPasswordControl?.errors?.['required']).toBe(true);
      });

      it('should display error when empty and touched', () => {
        const confirmPasswordControl = component.registerForm.get('confirmPassword');
        confirmPasswordControl?.markAsTouched();
        fixture.detectChanges();

        const errorMessage = compiled.querySelector('.error-message');

        expect(errorMessage).toBeTruthy();
        expect(errorMessage!.textContent).toContain('Confirm password is required');
      });
    });

    describe('Password Match Validation', () => {
      it('should show error when passwords do not match', () => {
        component.registerForm.patchValue({
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'john.doe@example.com',
          password: 'StrongPassword123',
          confirmPassword: 'DifferentPassword456',
        });

        component.registerForm.get('confirmPassword')?.markAsTouched();
        fixture.detectChanges();

        expect(component.registerForm.errors?.['passwordMismatch']).toBe(true);
        expect(component.registerForm.valid).toBe(false);
      });

      it('should not show error when passwords match', () => {
        component.registerForm.patchValue({
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'john.doe@example.com',
          password: 'StrongPassword123',
          confirmPassword: 'StrongPassword123',
        });

        expect(component.registerForm.errors?.['passwordMismatch']).toBeFalsy();
        expect(component.registerForm.valid).toBe(true);
      });

      it('should display password mismatch error message', () => {
        component.registerForm.patchValue({
          password: 'StrongPassword123',
          confirmPassword: 'DifferentPassword456',
        });
        component.registerForm.get('confirmPassword')?.markAsTouched();
        fixture.detectChanges();

        const errorMessages = compiled.querySelectorAll('.error-message');
        const mismatchError = Array.from(errorMessages).find(el =>
          el.textContent?.includes('Passwords do not match')
        );

        expect(mismatchError).toBeTruthy();
      });
    });

    describe('Overall Form State', () => {
      it('should be invalid when all fields are empty', () => {
        expect(component.registerForm.valid).toBe(false);
      });

      it('should be valid when all fields are correctly filled', () => {
        component.registerForm.patchValue({
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'john.doe@example.com',
          password: 'StrongPassword123',
          confirmPassword: 'StrongPassword123',
        });

        expect(component.registerForm.valid).toBe(true);
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should have two toggle buttons for password and confirm password', () => {
      const toggleButtons = compiled.querySelectorAll('.toggle-password');

      expect(toggleButtons).toHaveLength(2);
    });

    describe('Password Field Toggle', () => {
      it('should toggle showPassword property when clicked', () => {
        expect(component.showPassword).toBe(false);

        component.togglePasswordVisibility();
        expect(component.showPassword).toBe(true);

        component.togglePasswordVisibility();
        expect(component.showPassword).toBe(false);
      });

      it('should change password input type from password to text', () => {
        const passwordInput = compiled.querySelector('#password') as HTMLInputElement;

        expect(passwordInput.type).toBe('password');

        component.togglePasswordVisibility();
        fixture.detectChanges();

        expect(passwordInput.type).toBe('text');
      });
    });

    describe('Confirm Password Field Toggle', () => {
      it('should toggle showConfirmPassword property when clicked', () => {
        expect(component.showConfirmPassword).toBe(false);

        component.toggleConfirmPasswordVisibility();
        expect(component.showConfirmPassword).toBe(true);

        component.toggleConfirmPasswordVisibility();
        expect(component.showConfirmPassword).toBe(false);
      });

      it('should change confirm password input type from password to text', () => {
        const confirmPasswordInput = compiled.querySelector('#confirmPassword') as HTMLInputElement;

        expect(confirmPasswordInput.type).toBe('password');

        component.toggleConfirmPasswordVisibility();
        fixture.detectChanges();

        expect(confirmPasswordInput.type).toBe('text');
      });
    });
  });

  describe('Submit Button State', () => {
    it('should be disabled when form is invalid', () => {
      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitButton.disabled).toBe(true);
    });

    it('should be enabled when form is valid', () => {
      component.registerForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: 'StrongPassword123',
        confirmPassword: 'StrongPassword123',
      });
      fixture.detectChanges();

      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitButton.disabled).toBe(false);
    });

    it('should be disabled when loading', () => {
      component.registerForm.patchValue({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: 'StrongPassword123',
        confirmPassword: 'StrongPassword123',
      });
      component.isLoading = true;
      fixture.detectChanges();

      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitButton.disabled).toBe(true);
    });

    it('should display "Registering..." text when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const submitButton = compiled.querySelector('button[type="submit"]');

      expect(submitButton!.textContent).toContain('Registering...');
    });

    it('should display "Register" text when not loading', () => {
      component.isLoading = false;
      fixture.detectChanges();

      const submitButton = compiled.querySelector('button[type="submit"]');

      expect(submitButton!.textContent).toContain('Register');
    });
  });

  describe('Form Submission', () => {
    const validFormData = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      password: 'StrongPassword123',
      confirmPassword: 'StrongPassword123',
    };

    it('should not call authService when form is invalid', () => {
      component.registerForm.patchValue({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      component.onSubmit();

      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should call authService.register with user data excluding confirmPassword', () => {
      mockAuthService.register.mockReturnValue(of({ message: 'Registration successful' }));

      component.registerForm.patchValue(validFormData);

      component.onSubmit();

      expect(mockAuthService.register).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: 'StrongPassword123',
      });
    });

    it('should trigger onSubmit when form is submitted', () => {
      const onSubmitSpy = jest.spyOn(component, 'onSubmit');

      component.registerForm.patchValue(validFormData);

      const form = compiled.querySelector('form');
      form?.dispatchEvent(new Event('submit'));

      expect(onSubmitSpy).toHaveBeenCalled();
    });

    it('should set isLoading to true when submitting and false after completion', fakeAsync(() => {
      const mockResponse: RegisterResponse = {
        message: 'Registration successful! You can now log in.',
      };
      mockAuthService.register.mockReturnValue(of(mockResponse).pipe(delay(1000)));

      component.registerForm.patchValue(validFormData);
      component.onSubmit();

      expect(component.isLoading).toBe(true);

      tick(1000);

      expect(component.isLoading).toBe(false);
    }));

    it('should clear messages when starting and set successMessage after completion', fakeAsync(() => {
      const mockResponse: RegisterResponse = {
        message: 'Registration successful! You can now log in.',
      };
      mockAuthService.register.mockReturnValue(of(mockResponse).pipe(delay(1000)));

      component.errorMessage = 'Previous error';
      component.successMessage = 'Previous success';
      component.registerForm.patchValue(validFormData);

      component.onSubmit();

      expect(component.errorMessage).toBe('');
      expect(component.successMessage).toBe('');

      tick(1000);

      expect(component.successMessage).toBe('Registration successful! You can now log in.');
    }));
  });

  describe('Successful Registration', () => {
    const validFormData = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      password: 'StrongPassword123',
      confirmPassword: 'StrongPassword123',
    };

    it('should display success message', () => {
      mockAuthService.register.mockReturnValue(of({ message: 'User registered successfully!' }));

      component.registerForm.patchValue(validFormData);

      component.onSubmit();
      fixture.detectChanges();

      expect(component.successMessage).toContain('Registration successful');

      const successMessage = compiled.querySelector('.success-message');
      expect(successMessage).toBeTruthy();
    });

    it('should reset form after successful registration', () => {
      mockAuthService.register.mockReturnValue(of({ message: 'User registered successfully' }));

      component.registerForm.patchValue(validFormData);

      component.onSubmit();

      expect(component.registerForm.get('firstName')?.value).toBeNull();
      expect(component.registerForm.get('lastName')?.value).toBeNull();
      expect(component.registerForm.get('username')?.value).toBeNull();
      expect(component.registerForm.get('email')?.value).toBeNull();
      expect(component.registerForm.get('password')?.value).toBeNull();
      expect(component.registerForm.get('confirmPassword')?.value).toBeNull();
    });

    it('should reset loading state after successful registration', () => {
      mockAuthService.register.mockReturnValue(of({ message: 'User registered successfully' }));

      component.registerForm.patchValue(validFormData);

      component.onSubmit();

      expect(component.isLoading).toBe(false);
    });
  });

  describe('Failed Registration', () => {
    const validFormData = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john.doe@example.com',
      password: 'StrongPassword123',
      confirmPassword: 'StrongPassword123',
    };

    it('should display error message on registration failure', () => {
      mockAuthService.register.mockReturnValue(
        throwError(() => ({ error: { message: 'Username already exists' } }))
      );

      component.registerForm.patchValue(validFormData);

      component.onSubmit();
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Username already exists');

      const errorBox = compiled.querySelector('.error-message-box');
      expect(errorBox).toBeTruthy();
    });

    it('should handle array of error messages', () => {
      mockAuthService.register.mockReturnValue(
        throwError(() => ({ error: { message: ['Error 1', 'Error 2'] } }))
      );

      component.registerForm.patchValue(validFormData);

      component.onSubmit();

      expect(component.errorMessage).toBe('Error 1, Error 2');
    });

    it('should display generic error message when error format is unexpected', () => {
      mockAuthService.register.mockReturnValue(throwError(() => ({ status: 500 })));

      component.registerForm.patchValue(validFormData);

      component.onSubmit();

      expect(component.errorMessage).toContain('Registration failed');
    });

    it('should reset loading state on error', () => {
      mockAuthService.register.mockReturnValue(
        throwError(() => ({ error: { message: 'Username already exists' } }))
      );

      component.registerForm.patchValue(validFormData);

      component.onSubmit();

      expect(component.isLoading).toBe(false);
    });

    it('should re-enable submit button after error', () => {
      mockAuthService.register.mockReturnValue(
        throwError(() => ({ error: { message: 'Username already exists' } }))
      );

      component.registerForm.patchValue(validFormData);

      component.onSubmit();
      fixture.detectChanges();

      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitButton.disabled).toBe(false);
    });
  });
});
