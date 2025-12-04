import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard-component';
import { ROUTES, STORAGE_KEYS } from '../../core/constants/app.constants';
import { provideRouter, Router } from '@angular/router';
import { JwtDecoderService } from '../../core/services/jwt-decoder-service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let router: jasmine.SpyObj<Router>;
  let jwtDecoder: jasmine.SpyObj<JwtDecoderService>;

  const mockValidUser = {
    username: 'johndoe',
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    isExpired: false,
  };

  const mockExpiredUser = {
    username: 'johndoe',
    issuedAt: new Date(Date.now() - 7200000),
    expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
    isExpired: true,
  };

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const jwtDecoderSpy = jasmine.createSpyObj('JwtDecoderService', ['getUserFromToken']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: JwtDecoderService, useValue: jwtDecoderSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    jwtDecoder = TestBed.inject(JwtDecoderService) as jasmine.SpyObj<JwtDecoderService>;

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display the app title', () => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('.dashboard-header h1');

    expect(title).toBeTruthy();
    expect(title.textContent).toContain('SyncUp');
  });

  it('should load user info from token on init', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
    jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(jwtDecoder.getUserFromToken).toHaveBeenCalledWith('mock-token-12345');
    expect(component.username).toBe('Johndoe');
  });

  it('should capitalize first letter of username', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
    jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.username).toBe('Johndoe');
  });

  it('should display welcome message with username', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
    jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const welcomeText = compiled.querySelector('.welcome-text');

    expect(welcomeText).toBeTruthy();
    expect(welcomeText.textContent).toContain('Welcome, Johndoe!');
  });

  it('should redirect to login if no token exists', () => {
    jwtDecoder.getUserFromToken.and.returnValue(null);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
  });

  it('should redirect to login if token cannot be decoded', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'invalid-token');
    jwtDecoder.getUserFromToken.and.returnValue(null);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(jwtDecoder.getUserFromToken).toHaveBeenCalledWith('invalid-token');
    expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
  });

  it('should redirect to login if token is expired', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'expired-token');
    jwtDecoder.getUserFromToken.and.returnValue(mockExpiredUser);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.isTokenExpired).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
  });

  it('should store user data in localStorage', () => {
    // First set the token in localStorage BEFORE spying
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
    jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);

    // NOW spy on setItem to track future calls
    spyOn(localStorage, 'setItem');

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_DATA, jasmine.any(String));
  });

  it('should display logout button', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
    jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const logoutBtn = compiled.querySelector('.logout-btn');

    expect(logoutBtn).toBeTruthy();
    expect(logoutBtn.textContent).toContain('Logout');
  });

  it('should call logout when logout button is clicked', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
    jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    spyOn(component, 'logout');

    const compiled = fixture.nativeElement;
    const logoutBtn = compiled.querySelector('.logout-btn');
    logoutBtn.click();

    expect(component.logout).toHaveBeenCalled();
  });

  it('should remove token from localStorage on logout', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
    localStorage.setItem(STORAGE_KEYS.USER_DATA, '{"username":"test"}');
    jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.logout();

    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER_DATA)).toBeNull();
  });

  it('should navigate to login page on logout', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
    jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.logout();

    expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
  });

  it('should display dashboard heading', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
    jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const heading = compiled.querySelector('.welcome-section h2');

    expect(heading).toBeTruthy();
    expect(heading.textContent).toContain('Dashboard');
  });

  it('should display empty state message', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
    jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const emptyState = compiled.querySelector('.empty-state p');

    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('No task lists yet');
  });
});
