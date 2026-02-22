import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header-component';
import { provideRouter, Router } from '@angular/router';
import { AccountService, UserResponseDTO } from '../../../core/services/account-service';
import { of, Subject, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ROUTES, STORAGE_KEYS } from '../../../core/constants/app.constants';
import { HttpErrorResponse } from '@angular/common/http';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: jasmine.SpyObj<Router>;
  let accountService: jasmine.SpyObj<AccountService>;
  let compiled: HTMLElement;

  const mockAccountDetails: UserResponseDTO = {
    id: 1,
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  };

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const accountServiceSpy = jasmine.createSpyObj('AccountService', [
      'getAccountDetails',
      'deleteAccount',
    ]);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AccountService, useValue: accountServiceSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    accountService = TestBed.inject(AccountService) as jasmine.SpyObj<AccountService>;

    // Default successful response for account details
    accountService.getAccountDetails.and.returnValue(of(mockAccountDetails));

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should load account details on init', () => {
      fixture.detectChanges();

      expect(accountService.getAccountDetails).toHaveBeenCalled();
      expect(component.accountDetails).toEqual(mockAccountDetails);
    });

    it('should initialize with settings modal closed', () => {
      fixture.detectChanges();
      expect(component.isSettingsModalOpen).toBeFalse();
    });

    it('should initialize with account details as null', () => {
      expect(component.accountDetails).toBeNull();
    });

    it('should initialize with no error message', () => {
      expect(component.accountDetailsError).toBe('');
    });
  });

  describe('Text Logo', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display the SyncUp text logo', () => {
      const logoText = fixture.debugElement.query(By.css('.logo-text'));

      expect(logoText).toBeTruthy();
      expect(logoText.nativeElement.textContent.trim()).toBe('SyncUp');
    });

    it('should use Miltonian Tattoo font family', () => {
      const logoText = fixture.debugElement.query(By.css('.logo-text'));
      const styles = window.getComputedStyle(logoText.nativeElement);

      expect(styles.fontFamily).toContain('Miltonian Tattoo');
    });

    it('should navigate to dashboard when logo is clicked', () => {
      const logoContainer = fixture.debugElement.query(By.css('.logo-link'));
      logoContainer.nativeElement.click();

      expect(router.navigate).toHaveBeenCalledWith([ROUTES.DASHBOARD]);
    });
  });

  describe('Settings Button', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should display settings button', () => {
      const settingsButton = compiled.querySelector('.settings-btn');

      expect(settingsButton).toBeTruthy();
      expect(settingsButton!.textContent).toContain('Settings');
    });

    it('should open settings modal when clicked', () => {
      expect(component.isSettingsModalOpen).toBeFalse();

      const settingsButton = fixture.debugElement.query(By.css('.settings-btn'));
      settingsButton.nativeElement.click();

      expect(component.isSettingsModalOpen).toBeTrue();
    });

    it('should display settings icon', () => {
      const settingsButton = fixture.debugElement.query(By.css('.settings-btn'));
      const icon = settingsButton.nativeElement.querySelector('svg');

      expect(icon).toBeTruthy();
    });
  });

  describe('Settings Modal', () => {
    beforeEach(() => {
      component.username = 'johndoe';
      component.isSettingsModalOpen = true;
      fixture.detectChanges();
    });

    it('should display modal when isSettingsModalOpen is true', () => {
      const modal = fixture.debugElement.query(By.css('.settings-modal'));
      expect(modal).toBeTruthy();
    });

    it('should not display modal when isSettingsModalOpen is false', () => {
      component.isSettingsModalOpen = false;
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('.settings-modal'));
      expect(modal).toBeNull();
    });

    it('should display modal title', () => {
      const modalTitle = fixture.debugElement.query(By.css('.modal-title'));
      expect(modalTitle.nativeElement.textContent).toContain('Settings');
    });

    it('should have close button', () => {
      const closeButton = fixture.debugElement.query(By.css('.close-modal-btn'));
      expect(closeButton).toBeTruthy();
    });

    it('should close modal when close button is clicked', () => {
      const closeButton = fixture.debugElement.query(By.css('.close-modal-btn'));
      closeButton.nativeElement.click();

      expect(component.isSettingsModalOpen).toBeFalse();
    });

    it('should close modal when backdrop is clicked', () => {
      const backdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
      backdrop.nativeElement.click();

      expect(component.isSettingsModalOpen).toBeFalse();
    });

    it('should not close modal when modal content is clicked', () => {
      const modalContent = fixture.debugElement.query(By.css('.modal-content'));
      modalContent.nativeElement.click();

      expect(component.isSettingsModalOpen).toBeTrue();
    });
  });

  describe('Account Details Loading', () => {
    it('should display loading state while fetching account details', () => {
      const accountSubject = new Subject<UserResponseDTO>();
      accountService.getAccountDetails.and.returnValue(accountSubject.asObservable());

      component.loadAccountDetails();
      component.isSettingsModalOpen = true;

      fixture.detectChanges();

      const loadingContainer = fixture.debugElement.query(By.css('.loading-container'));
      const spinner = fixture.debugElement.query(By.css('.spinner'));

      expect(loadingContainer).toBeTruthy(); // Should now be found
      expect(spinner).toBeTruthy();

      accountSubject.next(mockAccountDetails);
      accountSubject.complete();
    });

    it('should display error message when loading fails', () => {
      const errorSubject = new Subject<UserResponseDTO>();
      accountService.getAccountDetails.and.returnValue(errorSubject.asObservable());

      component.isSettingsModalOpen = true;
      component.loadAccountDetails();

      const mockError = new HttpErrorResponse({
        error: { message: 'Internal Server Error' },
        status: 500,
        statusText: 'Server Error',
      });

      errorSubject.error(mockError);
      fixture.detectChanges();

      const errorContainer = fixture.debugElement.query(By.css('.error-container'));

      expect(errorContainer).toBeTruthy();
      expect(component.accountDetailsError).toBe('Failed to load account details');
      expect(component.isLoadingAccountDetails).toBeFalse();
    });

    it('should set loading state to false after successful fetch', () => {
      fixture.detectChanges();

      expect(component.isLoadingAccountDetails).toBeFalse();
    });

    it('should store account details after successful fetch', () => {
      fixture.detectChanges();

      expect(component.accountDetails).toEqual(mockAccountDetails);
    });
  });

  describe('Account Details Display', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.isSettingsModalOpen = true;
      fixture.detectChanges();
    });

    it('should display account information section', () => {
      const accountSection = fixture.debugElement.query(By.css('.account-info'));
      expect(accountSection).toBeTruthy();
    });

    it('should display username', () => {
      const detailsContainer = compiled.querySelector('.details-container');
      expect(detailsContainer!.textContent).toContain('johndoe');
    });

    it('should display first name', () => {
      const detailsContainer = compiled.querySelector('.details-container');
      expect(detailsContainer!.textContent).toContain('John');
    });

    it('should display last name', () => {
      const detailsContainer = compiled.querySelector('.details-container');
      expect(detailsContainer!.textContent).toContain('Doe');
    });

    it('should display email', () => {
      const detailsContainer = compiled.querySelector('.details-container');
      expect(detailsContainer!.textContent).toContain('john.doe@example.com');
    });

    it('should display all info rows', () => {
      const infoRows = compiled.querySelectorAll('.info-row');
      expect(infoRows.length).toBe(4); // username, firstName, lastName, email
    });
  });

  describe('Account Details Error Handling', () => {
    it('should display error message when fetch fails', () => {
      accountService.getAccountDetails.and.returnValue(
        throwError(() => ({ status: 500, error: { message: 'Server error' } }))
      );

      fixture.detectChanges();
      component.isSettingsModalOpen = true;
      fixture.detectChanges();

      expect(component.accountDetailsError).toBe('Failed to load account details');

      const errorContainer = compiled.querySelector('.error-container');
      const errorText = compiled.querySelector('.error-text');

      expect(errorContainer).toBeTruthy();
      expect(errorText!.textContent).toContain('Failed to load account details');
    });

    it('should display retry button on error', () => {
      accountService.getAccountDetails.and.returnValue(
        throwError(() => ({ status: 500, error: { message: 'Server error' } }))
      );

      fixture.detectChanges();
      component.isSettingsModalOpen = true;
      fixture.detectChanges();

      const retryButton = compiled.querySelector('.retry-btn');
      expect(retryButton).toBeTruthy();
      expect(retryButton!.textContent).toContain('Retry');
    });

    it('should reload account details when retry button is clicked', () => {
      accountService.getAccountDetails.and.returnValue(
        throwError(() => ({ status: 500, error: { message: 'Server error' } }))
      );

      fixture.detectChanges();

      // Reset spy and return success
      accountService.getAccountDetails.calls.reset();
      accountService.getAccountDetails.and.returnValue(of(mockAccountDetails));

      component.isSettingsModalOpen = true;
      fixture.detectChanges();

      const retryButton = compiled.querySelector('.retry-btn') as HTMLButtonElement;
      retryButton.click();

      expect(accountService.getAccountDetails).toHaveBeenCalled();
    });

    it('should redirect to login on 401 error', () => {
      accountService.getAccountDetails.and.returnValue(
        throwError(() => ({ status: 401, error: { message: 'Unauthorized' } }))
      );

      fixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should set loading state to false after error', () => {
      accountService.getAccountDetails.and.returnValue(
        throwError(() => ({ status: 500, error: { message: 'Server error' } }))
      );

      fixture.detectChanges();

      expect(component.isLoadingAccountDetails).toBeFalse();
    });
  });

  describe('Logout Functionality', () => {
    beforeEach(() => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token');
      localStorage.setItem(STORAGE_KEYS.USER_DATA, '{"username":"test"}');
      fixture.detectChanges();
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should display logout button', () => {
      component.isSettingsModalOpen = true;
      fixture.detectChanges();

      const logoutButton = fixture.debugElement.query(By.css('.logout-btn'));
      expect(logoutButton).toBeTruthy();
      expect(logoutButton.nativeElement.textContent).toContain('Logout');
    });

    it('should clear localStorage on logout', () => {
      component.logout();

      expect(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.USER_DATA)).toBeNull();
    });

    it('should navigate to login page on logout', () => {
      component.logout();

      expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should close modal on logout', () => {
      component.isSettingsModalOpen = true;
      component.logout();

      expect(component.isSettingsModalOpen).toBeFalse();
    });
  });
});
