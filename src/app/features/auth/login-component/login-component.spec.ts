import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login-component';
import { RegisterComponent } from '../register-component/register-component';
import { AuthService } from '../../../core/services/auth-service';
import { ERROR_MESSAGES, VALIDATION } from '../../../core/constants/app.constants';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: { login: jest.Mock };
  let compiled: HTMLElement;

  beforeEach(async () => {
    // Create mock services
    mockAuthService = {
      login: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        provideRouter([
          { path: 'register', component: RegisterComponent },
          { path: 'login', component: LoginComponent },
          { path: 'dashboard', component: LoginComponent },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
      expect(component.loginForm.get('username')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('should initialize loading state as false', () => {
      expect(component.isLoading).toBe(false);
    });

    it('should initialize with no error message', () => {
      expect(component.errorMessage).toBe('');
    });

    it('should initialize password visibility as hidden', () => {
      expect(component.showPassword).toBe(false);
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
    it('should display "Welcome Back" as the form title', () => {
      const heading = compiled.querySelector('h2');

      expect(heading).toBeTruthy();
      expect(heading!.textContent).toContain('Welcome Back');
    });

    it('should render username input field', () => {
      const usernameInput = compiled.querySelector('#username');

      expect(usernameInput).toBeTruthy();
      expect(usernameInput?.getAttribute('type')).toBe('text');
    });

    it('should render password input field', () => {
      const passwordInput = compiled.querySelector('#password');

      expect(passwordInput).toBeTruthy();
    });

    it('should render submit button', () => {
      const submitButton = compiled.querySelector('button[type="submit"]');

      expect(submitButton).toBeTruthy();
    });

    it('should display register prompt with link', () => {
      const registerPrompt = compiled.querySelector('.register-prompt');
      const registerLink = compiled.querySelector('.register-prompt a');

      expect(registerPrompt).toBeTruthy();
      expect(registerPrompt!.textContent).toContain("Don't have an account");
      expect(registerLink).toBeTruthy();
      expect(registerLink!.textContent).toContain('Register here');
    });

    it('should render footer component', () => {
      const footerElement = fixture.debugElement.query(By.css('app-footer-component'));

      expect(footerElement).toBeTruthy();
    });
  });

  describe('Form Validation', () => {
    describe('Username Field', () => {
      it('should be invalid when empty', () => {
        const usernameControl = component.loginForm.get('username');

        expect(usernameControl?.valid).toBe(false);
        expect(usernameControl?.errors?.['required']).toBe(true);
      });

      it('should be valid when filled', () => {
        const usernameControl = component.loginForm.get('username');
        usernameControl?.setValue('johndoe');

        expect(usernameControl?.valid).toBe(true);
      });

      it('should display error message when empty and touched', () => {
        const usernameControl = component.loginForm.get('username');
        usernameControl?.markAsTouched();
        fixture.detectChanges();

        const errorMessage = compiled.querySelector('.error-message');

        expect(errorMessage).toBeTruthy();
        expect(errorMessage!.textContent).toContain('Username is required');
      });
    });

    describe('Password Field', () => {
      it('should be invalid when empty', () => {
        const passwordControl = component.loginForm.get('password');

        expect(passwordControl?.valid).toBe(false);
        expect(passwordControl?.errors?.['required']).toBe(true);
      });

      it(`should be invalid when less than ${VALIDATION.PASSWORD_MIN_LENGTH} characters`, () => {
        const passwordControl = component.loginForm.get('password');
        passwordControl?.setValue('short');

        expect(passwordControl?.valid).toBe(false);
        expect(passwordControl?.errors?.['minlength']).toBeTruthy();
      });

      it(`should be valid when ${VALIDATION.PASSWORD_MIN_LENGTH} or more characters`, () => {
        const passwordControl = component.loginForm.get('password');
        passwordControl?.setValue('StrongPassword123');

        expect(passwordControl?.valid).toBe(true);
      });

      it('should display error when empty and touched', () => {
        const passwordControl = component.loginForm.get('password');
        passwordControl?.markAsTouched();
        fixture.detectChanges();

        const errorMessage = compiled.querySelector('.error-message');

        expect(errorMessage).toBeTruthy();
        expect(errorMessage!.textContent).toContain('Password is required');
      });

      it('should display error when too short and touched', () => {
        const passwordControl = component.loginForm.get('password');
        passwordControl?.setValue('short');
        passwordControl?.markAsTouched();
        fixture.detectChanges();

        const errorMessage = compiled.querySelector('.error-message');

        expect(errorMessage).toBeTruthy();
        expect(errorMessage!.textContent).toContain(
          `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`
        );
      });
    });

    describe('Overall Form State', () => {
      it('should be invalid when both fields are empty', () => {
        expect(component.loginForm.valid).toBe(false);
      });

      it('should be invalid when only username is filled', () => {
        component.loginForm.patchValue({
          username: 'johndoe',
          password: '',
        });

        expect(component.loginForm.valid).toBe(false);
      });

      it('should be invalid when only password is filled', () => {
        component.loginForm.patchValue({
          username: '',
          password: 'StrongPassword123',
        });

        expect(component.loginForm.valid).toBe(false);
      });

      it('should be valid when both fields are correctly filled', () => {
        component.loginForm.patchValue({
          username: 'johndoe',
          password: 'StrongPassword123',
        });

        expect(component.loginForm.valid).toBe(true);
      });
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should have a toggle button', () => {
      const toggleButton = compiled.querySelector('.toggle-password');

      expect(toggleButton).toBeTruthy();
      expect(toggleButton!.textContent).toContain('Show');
    });

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

    it('should update toggle button text when visibility changes', () => {
      const toggleButton = compiled.querySelector('.toggle-password');

      expect(toggleButton!.textContent).toContain('Show');

      component.togglePasswordVisibility();
      fixture.detectChanges();

      expect(toggleButton!.textContent).toContain('Hide');
    });
  });

  describe('Submit Button State', () => {
    it('should be disabled when form is invalid', () => {
      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitButton.disabled).toBe(true);
    });

    it('should be enabled when form is valid', () => {
      component.loginForm.patchValue({
        username: 'johndoe',
        password: 'StrongPassword123',
      });
      fixture.detectChanges();

      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitButton.disabled).toBe(false);
    });

    it('should be disabled when loading', () => {
      component.loginForm.patchValue({
        username: 'johndoe',
        password: 'StrongPassword123',
      });
      component.isLoading = true;
      fixture.detectChanges();

      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitButton.disabled).toBe(true);
    });

    it('should display "Logging in..." text when loading', () => {
      component.isLoading = true;
      fixture.detectChanges();

      const submitButton = compiled.querySelector('button[type="submit"]');

      expect(submitButton!.textContent).toContain('Logging in...');
    });

    it('should display "Log In" text when not loading', () => {
      component.isLoading = false;
      fixture.detectChanges();

      const submitButton = compiled.querySelector('button[type="submit"]');

      expect(submitButton!.textContent).toContain('Log In');
    });
  });

  describe('Form Submission', () => {
    it('should not call authService when form is invalid', () => {
      component.loginForm.patchValue({
        username: '',
        password: '',
      });

      component.onSubmit();

      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should call authService.login with correct credentials', () => {
      mockAuthService.login.mockReturnValue(of({ token: 'mock-jwt-token' }));

      component.loginForm.patchValue({
        username: 'johndoe',
        password: 'StrongPassword123',
      });

      component.onSubmit();

      expect(mockAuthService.login).toHaveBeenCalledWith({
        username: 'johndoe',
        password: 'StrongPassword123',
      });
    });

    it('should trigger onSubmit when form is submitted', () => {
      // Senior tip: mockImplementation() prevents the real (and complex) logic from running
      const onSubmitSpy = jest.spyOn(component, 'onSubmit').mockImplementation(() => {});

      component.loginForm.patchValue({
        username: 'johndoe',
        password: 'StrongPassword123',
      });

      const form = compiled.querySelector('form');
      form?.dispatchEvent(new Event('submit'));

      expect(onSubmitSpy).toHaveBeenCalled();

      onSubmitSpy.mockRestore(); // Clean up
    });

    it('should set isLoading to true when submitting', () => {
      mockAuthService.login.mockReturnValue(of({ token: 'mock-jwt-token' }));

      component.loginForm.patchValue({
        username: 'johndoe',
        password: 'StrongPassword123',
      });

      component.onSubmit();

      expect(component.isLoading).toBe(true);
    });

    it('should clear error message when submitting', () => {
      mockAuthService.login.mockReturnValue(of({ token: 'mock-jwt-token' }));
      component.errorMessage = 'Previous error';

      component.loginForm.patchValue({
        username: 'johndoe',
        password: 'StrongPassword123',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('Successful Login', () => {
    it('should store token in localStorage', () => {
      const setItemSpy = jest.spyOn(window.localStorage, 'setItem').mockImplementation(() => {});

      mockAuthService.login.mockReturnValue(of({ token: 'mock-jwt-token-12345' }));

      component.loginForm.patchValue({
        username: 'johndoe',
        password: 'StrongPassword123',
      });
      component.loginForm.updateValueAndValidity();

      component.onSubmit();

      expect(setItemSpy).toHaveBeenCalled();
      expect(setItemSpy).toHaveBeenCalledWith('token', 'mock-jwt-token-12345');

      setItemSpy.mockRestore();
    });

    it('should navigate to dashboard', fakeAsync(() => {
      const router = TestBed.inject(Router);
      const navigateSpy = jest.spyOn(router, 'navigate');

      mockAuthService.login.mockReturnValue(of({ token: 'mock-jwt-token' }));

      component.loginForm.controls['username'].setValue('johndoe');
      component.loginForm.controls['password'].setValue('StrongPassword123');
      component.loginForm.updateValueAndValidity();

      component.onSubmit();

      tick();
      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    }));
  });

  describe('Failed Login', () => {
    it('should display error message on login failure', () => {
      mockAuthService.login.mockReturnValue(
        throwError(() => ({ error: { message: 'Invalid credentials' } }))
      );

      component.loginForm.patchValue({
        username: 'johndoe',
        password: 'wrongpassword',
      });

      component.onSubmit();
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Invalid credentials');

      const errorBox = compiled.querySelector('.error-message-box');
      expect(errorBox).toBeTruthy();
      expect(errorBox!.textContent).toContain('Invalid credentials');
    });

    it('should handle array of error messages', () => {
      mockAuthService.login.mockReturnValue(
        throwError(() => ({ error: { message: ['Error 1', 'Error 2'] } }))
      );

      component.loginForm.patchValue({
        username: 'johndoe',
        password: 'StrongPassword123',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('Error 1, Error 2');
    });

    it('should display generic error message when error format is unexpected', () => {
      mockAuthService.login.mockReturnValue(throwError(() => ({ status: 500 })));

      component.loginForm.patchValue({
        username: 'johndoe',
        password: 'StrongPassword123',
      });

      component.onSubmit();

      expect(component.errorMessage).toBe(ERROR_MESSAGES.LOGIN_FAILED);
    });

    it('should reset loading state on error', () => {
      mockAuthService.login.mockReturnValue(
        throwError(() => ({ error: { message: 'Invalid credentials' } }))
      );

      component.loginForm.patchValue({
        username: 'johndoe',
        password: 'wrongpassword',
      });

      component.onSubmit();

      expect(component.isLoading).toBe(false);
    });

    it('should re-enable submit button after error', () => {
      mockAuthService.login.mockReturnValue(
        throwError(() => ({ error: { message: 'Invalid credentials' } }))
      );

      component.loginForm.patchValue({
        username: 'johndoe',
        password: 'wrongpassword',
      });

      component.onSubmit();
      fixture.detectChanges();

      const submitButton = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

      expect(submitButton.disabled).toBe(false);
    });

    it('should clear error message on new submission attempt', () => {
      mockAuthService.login.mockReturnValue(
        throwError(() => ({ error: { message: 'Invalid credentials' } }))
      );

      component.loginForm.patchValue({
        username: 'johndoe',
        password: 'wrongpassword',
      });

      component.onSubmit();
      expect(component.errorMessage).toBeTruthy();

      // Now make it succeed
      mockAuthService.login.mockReturnValue(of({ token: 'mock-jwt-token' }));
      component.loginForm.patchValue({ password: 'correctpassword' });

      component.onSubmit();

      expect(component.errorMessage).toBe('');
    });
  });
});
