import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login-component';
import { ReactiveFormsModule } from '@angular/forms';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  // let authService: jasmine.SpyObj<AuthService>;
  // let router: jasmine.SpyObj<Router>

  beforeEach(async () => {
    // const authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);
    // const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        // {provide: AuthService, useValue: authServiceSpy},
        // {provide: Router, useValue: routerSpy},
        // provideRouter([]),
      ],
    }).compileComponents();

    // authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
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
});
