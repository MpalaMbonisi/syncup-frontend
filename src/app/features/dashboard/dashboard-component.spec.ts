import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard-component';
import { ROUTES, STORAGE_KEYS } from '../../core/constants/app.constants';
import { provideRouter, Router } from '@angular/router';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [{ provide: Router, useValue: routerSpy }, provideRouter([])],
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    localStorage.clear();
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the app title', () => {
    const compiled = fixture.nativeElement;
    const title = compiled.querySelector('.dashboard-header h1');

    expect(title).toBeTruthy();
    expect(title.textContent).toContain('SyncUp');
  });

  it('should display welcome message with username', () => {
    component.username = 'John';
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    const welcomeText = compiled.querySelector('.welcome-text');

    expect(welcomeText).toBeTruthy();
    expect(welcomeText.textContent).toContain('Welcome, John!');
  });

  it('should display logout button', () => {
    const compiled = fixture.nativeElement;
    const logoutBtn = compiled.querySelector('.logout-btn');

    expect(logoutBtn).toBeTruthy();
    expect(logoutBtn.textContent).toContain('Logout');
  });

  it('should display dashboard heading', () => {
    const compiled = fixture.nativeElement;
    const heading = compiled.querySelector('.welcome-section h2');

    expect(heading).toBeTruthy();
    expect(heading.textContent).toContain('Dashboard');
  });

  it('should display welcome description', () => {
    const compiled = fixture.nativeElement;
    const description = compiled.querySelector('.welcome-section p');

    expect(description).toBeTruthy();
    expect(description.textContent).toContain('Welcome to your task management dashboard');
  });

  it('should display task lists section header', () => {
    const compiled = fixture.nativeElement;
    const sectionHeader = compiled.querySelector('.task-lists-section h3');

    expect(sectionHeader).toBeTruthy();
    expect(sectionHeader.textContent).toContain('Your Task Lists');
  });

  it('should display new list button', () => {
    const compiled = fixture.nativeElement;
    const newListBtn = compiled.querySelector('.btn-primary');

    expect(newListBtn).toBeTruthy();
    expect(newListBtn.textContent).toContain('+ New List');
  });

  it('should display empty state message', () => {
    const compiled = fixture.nativeElement;
    const emptyState = compiled.querySelector('.empty-state p');

    expect(emptyState).toBeTruthy();
    expect(emptyState.textContent).toContain('No task lists yet');
  });

  it('should initialise username', () => {
    expect(component.username).toBeDefined();
  });

  it('should call logout when logout button is clicked', () => {
    spyOn(component, 'logout');

    const compiled = fixture.nativeElement;
    const logoutBtn = compiled.querySelector('.logout-btn');

    logoutBtn.click();

    expect(component.logout).toHaveBeenCalled();
  });

  it('should remove token from localStorage on logout', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-jwt-token-12345');
    localStorage.setItem(STORAGE_KEYS.USER_DATA, 'mock-jwt-token-12345');

    component.logout();

    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER_DATA)).toBeNull();
  });

  it('should navigate to login page on logout', () => {
    component.logout();

    expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
  });

  it('should clear both token and user data on logout', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-jwt-token-12345');
    localStorage.setItem(STORAGE_KEYS.USER_DATA, '{"username": "test"}');

    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeTruthy();
    expect(localStorage.getItem(STORAGE_KEYS.USER_DATA)).toBeTruthy();

    component.logout();

    expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.USER_DATA)).toBeNull();
  });

  it('should have main content section', () => {
    const compiled = fixture.nativeElement;
    const main = compiled.querySelector('.dashboard-main');

    expect(main).toBeTruthy();
    expect(main.querySelector('.dashboard-content')).toBeTruthy();
  });

  it('should have sticky header with proper structure', () => {
    const compiled = fixture.nativeElement;
    const header = compiled.querySelector('.dashboard-header');

    expect(header).toBeTruthy();
    expect(header.querySelector('.header-content')).toBeTruthy();
    expect(header.querySelector('.header-actions')).toBeTruthy();
  });

  it('should call ngOnInit on component initialisation', () => {
    spyOn(component, 'ngOnInit');

    component.ngOnInit();

    expect(component.ngOnInit).toHaveBeenCalled();
  });
});
