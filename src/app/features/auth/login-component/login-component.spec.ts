import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login-component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ERROR_MESSAGES, VALIDATION } from '../../../core/constants/app.constants';
import { provideRouter } from '@angular/router';
import { RegisterComponent } from '../register-component/register-component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  // let router: jasmine.SpyObj<Router>

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    // const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        // {provide: Router, useValue: routerSpy},
        provideRouter([
          { path: 'register', component: RegisterComponent },
          { path: 'login', component: RegisterComponent }, // Mock route
        ]),
      ],
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    // router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display login form title', () => {
    const compiled = fixture.nativeElement;
    const heading = compiled.querySelector('h2');

    expect(heading).toBeTruthy();
    expect(heading.textContent).toContain('Welcome Back');
  });

  it('should have username and password fields', () => {
    const compiled = fixture.nativeElement;

    expect(compiled.querySelector('#username')).toBeTruthy();
    expect(compiled.querySelector('#password')).toBeTruthy();
    expect(compiled.querySelector('button[type="submit"]')).toBeTruthy();
  });

  it('should initialise form with empty values', () => {
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should initialise loading as false', () => {
    expect(component.isLoading).toBeFalse();
  });

  it('should mark form as invalid when fields are empty', () => {
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should mark form as valid when both fields are filled correctly', () => {
    component.loginForm.patchValue({
      username: 'johndoe',
      password: 'StrongPassword1234',
    });

    expect(component.loginForm.valid).toBeTrue();
  });

  it('should show error when username is empty and touched', () => {
    const usernameControl = component.loginForm.get('username');
    const compiled = fixture.nativeElement;

    usernameControl?.markAsTouched();
    fixture.detectChanges();

    const errorMessage = compiled.querySelector('.error-message');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toContain('Username is required');
  });

  it('should show error when password is empty and touched', () => {
    const passwordControl = component.loginForm.get('password');
    const compiled = fixture.nativeElement;

    passwordControl?.markAsTouched();
    fixture.detectChanges();

    const errorMessage = compiled.querySelector('.error-message');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toContain('Password is required');
  });

  it(`should show error when password is less than ${VALIDATION.PASSWORD_MIN_LENGTH} characters`, () => {
    const passwordControl = component.loginForm.get('password');
    const compiled = fixture.nativeElement;

    component.loginForm.patchValue({ password: 'short' });
    passwordControl?.markAsTouched();
    fixture.detectChanges();

    const errorMessage = compiled.querySelector('.error-message');
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.textContent).toContain(
      `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`
    );
  });

  it('should disable submit button when form is invalid', () => {
    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('button[type="submit"]');

    expect(submitButton.disabled).toBeTrue();
  });

  it('should enable submit button when form is valid', () => {
    component.loginForm.patchValue({
      username: 'johndoe',
      password: 'StrongPassword1234',
    });

    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const submitButton = compiled.querySelector('button[type="submit"]');

    expect(submitButton.disabled).toBeFalse();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();

    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();

    component.togglePasswordVisibility();
    expect(component.showPassword).toBeFalse();
  });

  it('should change password input type when toggling visibility', () => {
    const compiled = fixture.nativeElement;
    const passwordInput = compiled.querySelector('#password');

    expect(passwordInput.type).toBe('password');

    component.togglePasswordVisibility();
    fixture.detectChanges();

    expect(passwordInput.type).toBe('text');
  });

  it('should display password visibility toggle button', () => {
    const compiled = fixture.nativeElement;
    const toggleButton = compiled.querySelector('.toggle-password');

    expect(toggleButton).toBeTruthy();
    expect(toggleButton.textContent).toContain('Show');
  });

  it('should call onSubmit when form is submitted with valid data', () => {
    spyOn(component, 'onSubmit');

    component.loginForm.patchValue({
      username: 'johndoe',
      password: 'password1234',
    });

    const compiled = fixture.nativeElement;
    const form = compiled.querySelector('form');
    form.dispatchEvent(new Event('submit'));

    expect(component.onSubmit).toHaveBeenCalled();
  });

  it('should call authService.login with correct credentials', () => {
    authService.login.and.returnValue(of({ token: 'mock-jwt-token-12345' }));

    component.loginForm.patchValue({
      username: 'johndoe',
      password: 'PasswordStrong1234',
    });

    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith({
      username: 'johndoe',
      password: 'PasswordStrong1234',
    });
  });

  it('should store token in localStorage on successful login', () => {
    spyOn(localStorage, 'setItem');
    authService.login.and.returnValue(of({ token: 'mock-jwt-token-12345' }));

    component.loginForm.patchValue({
      username: 'johndoe',
      password: 'PasswordStrong1234',
    });

    component.onSubmit();

    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'mock-jwt-token-12345');
  });

  it('should display error message when login fails', () => {
    authService.login.and.returnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' } }))
    );

    component.loginForm.patchValue({
      username: 'johndoe',
      password: 'wrongPassword1234',
    });

    component.onSubmit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const errorMessage = compiled.querySelector('.error-message-box');

    expect(errorMessage).toBeTruthy();
    expect(component.errorMessage).toBe('Invalid credentials');
  });

  it('should display generic error message when error format is unexpected', () => {
    authService.login.and.returnValue(throwError(() => ({ status: 500 })));

    component.loginForm.patchValue({
      username: 'johndoe',
      password: 'StrongPassword1234',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe(ERROR_MESSAGES.LOGIN_FAILED);
  });

  it('should handle array of error messages', () => {
    authService.login.and.returnValue(
      throwError(() => ({ error: { message: ['Error 1', 'Error 2'] } }))
    );

    component.loginForm.patchValue({
      username: 'johndoe',
      password: 'StrongPassword1234',
    });

    component.onSubmit();

    expect(component.errorMessage).toBe('Error 1, Error 2');
  });

  it('should clear error message on new submission attempt', () => {
    authService.login.and.returnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' } }))
    );

    component.loginForm.patchValue({
      username: 'johndoe',
      password: 'WrongPassword',
    });

    component.onSubmit();
    expect(component.errorMessage).toBeTruthy();

    // Make it succeed
    authService.login.and.returnValue(of({ token: 'mock-jwt-token-12345' }));
    component.loginForm.patchValue({ password: 'StrongPassword123' });

    component.onSubmit();

    expect(component.errorMessage).toBe('');
  });

  it('should display register prompt with link', () => {
    const compiled = fixture.nativeElement;
    const registerPrompt = compiled.querySelector('.register-prompt');
    const registerLink = compiled.querySelector('.register-prompt a');

    expect(registerPrompt).toBeTruthy();
    expect(registerPrompt.textContent).toContain("Don't have an account");
    expect(registerLink).toBeTruthy();
    expect(registerLink.textContent).toContain('Register here');
  });

  it('should display the footer component', () => {
    const footerElement = fixture.debugElement.query(By.css('app-footer-component'));

    expect(footerElement).not.toBeNull();
    expect(footerElement).toBeTruthy();
  });

  it('should not call authService.login if form is invalid', () => {
    component.loginForm.patchValue({
      username: '',
      password: '',
    });

    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
  });
});
