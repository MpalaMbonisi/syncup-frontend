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
  let mockRouter: { navigate: jest.Mock };
  let mockAccountService: { getAccountDetails: jest.Mock; deleteAccount: jest.Mock };
  let compiled: HTMLElement;

  const mockAccountDetails: UserResponseDTO = {
    id: 1,
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
  };

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn(),
    };

    mockAccountService = {
      getAccountDetails: jest.fn(),
      deleteAccount: jest.fn(),
    };

    // Default successful response for account details
    mockAccountService.getAccountDetails.mockReturnValue(of(mockAccountDetails));

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AccountService, useValue: mockAccountService },
        provideRouter([]),
      ],
    }).compileComponents();

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

      expect(mockAccountService.getAccountDetails).toHaveBeenCalled();
      expect(component.accountDetails).toEqual(mockAccountDetails);
    });

    it('should initialize with settings modal closed', () => {
      fixture.detectChanges();
      expect(component.isSettingsModalOpen).toBe(false);
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

      expect(logoText.nativeElement.classList).toContain('logo-text');
    });

    it('should navigate to dashboard when logo is clicked', () => {
      const logoContainer = fixture.debugElement.query(By.css('.logo-link'));
      logoContainer.nativeElement.click();

      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTES.DASHBOARD]);
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
      expect(component.isSettingsModalOpen).toBe(false);

      const settingsButton = fixture.debugElement.query(By.css('.settings-btn'));
      settingsButton.nativeElement.click();

      expect(component.isSettingsModalOpen).toBe(true);
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

      expect(component.isSettingsModalOpen).toBe(false);
    });

    it('should close modal when backdrop is clicked', () => {
      const backdrop = fixture.debugElement.query(By.css('.modal-backdrop'));
      backdrop.nativeElement.click();

      expect(component.isSettingsModalOpen).toBe(false);
    });

    it('should not close modal when modal content is clicked', () => {
      component.isSettingsModalOpen = true;
      fixture.detectChanges();

      const event = new MouseEvent('click');
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation');

      component.onModalContentClick(event);

      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(component.isSettingsModalOpen).toBe(true);
    });

    it('should toggle button text based on deleting state', () => {
      component.isDeletingAccount = true;
      fixture.detectChanges();
      const btn = fixture.debugElement.query(By.css('.delete-account-btn')).nativeElement;
      expect(btn.textContent).toContain('Deleting...');

      component.isDeletingAccount = false;
      fixture.detectChanges();
      expect(btn.textContent).toContain('Delete Account');
    });
  });

  describe('Account Details Loading', () => {
    it('should display loading state while fetching account details', () => {
      const accountSubject = new Subject<UserResponseDTO>();
      mockAccountService.getAccountDetails.mockReturnValue(accountSubject.asObservable());

      component.loadAccountDetails();
      component.isSettingsModalOpen = true;

      fixture.detectChanges();

      const loadingContainer = fixture.debugElement.query(By.css('.loading-container'));
      const spinner = fixture.debugElement.query(By.css('.spinner'));

      expect(loadingContainer).toBeTruthy();
      expect(spinner).toBeTruthy();

      accountSubject.next(mockAccountDetails);
      accountSubject.complete();
    });

    it('should display error message when loading fails', () => {
      const errorSubject = new Subject<UserResponseDTO>();
      mockAccountService.getAccountDetails.mockReturnValue(errorSubject.asObservable());

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
      expect(component.isLoadingAccountDetails).toBe(false);
    });

    it('should set loading state to false after successful fetch', () => {
      fixture.detectChanges();

      expect(component.isLoadingAccountDetails).toBe(false);
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
      expect(infoRows).toHaveLength(4); // username, firstName, lastName, email
    });
  });

  describe('Account Details Error Handling', () => {
    it('should display error message when fetch fails', () => {
      mockAccountService.getAccountDetails.mockReturnValue(
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
      mockAccountService.getAccountDetails.mockReturnValue(
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
      mockAccountService.getAccountDetails.mockReturnValue(
        throwError(() => ({ status: 500, error: { message: 'Server error' } }))
      );

      fixture.detectChanges();

      // Reset mock and return success
      mockAccountService.getAccountDetails.mockClear();
      mockAccountService.getAccountDetails.mockReturnValue(of(mockAccountDetails));

      component.isSettingsModalOpen = true;
      fixture.detectChanges();

      const retryButton = compiled.querySelector('.retry-btn') as HTMLButtonElement;
      retryButton.click();

      expect(mockAccountService.getAccountDetails).toHaveBeenCalled();
    });

    it('should redirect to login on 401 error', () => {
      mockAccountService.getAccountDetails.mockReturnValue(
        throwError(() => ({ status: 401, error: { message: 'Unauthorized' } }))
      );

      fixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should set loading state to false after error', () => {
      mockAccountService.getAccountDetails.mockReturnValue(
        throwError(() => ({ status: 500, error: { message: 'Server error' } }))
      );

      fixture.detectChanges();

      expect(component.isLoadingAccountDetails).toBe(false);
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

      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should close modal on logout', () => {
      component.isSettingsModalOpen = true;
      component.logout();

      expect(component.isSettingsModalOpen).toBe(false);
    });
  });

  describe('Delete Account Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
      component.isSettingsModalOpen = true;
      fixture.detectChanges();
    });

    it('should display delete account button', () => {
      const deleteButton = fixture.debugElement.query(By.css('.delete-account-btn'));
      expect(deleteButton).toBeTruthy();
      expect(deleteButton.nativeElement.textContent).toContain('Delete Account');
    });

    it('should show confirmation dialog when delete button is clicked', () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);

      const deleteButton = fixture.debugElement.query(By.css('.delete-account-btn'));
      deleteButton.nativeElement.click();

      expect(confirmSpy).toHaveBeenCalledWith(
        expect.stringContaining('Are you sure you want to delete your account?')
      );

      confirmSpy.mockRestore();
    });

    it('should not delete account if user cancels confirmation', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(false);

      component.deleteAccount();

      expect(mockAccountService.deleteAccount).not.toHaveBeenCalled();
    });

    it('should delete account if user confirms', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      jest.spyOn(window, 'alert').mockImplementation();
      mockAccountService.deleteAccount.mockReturnValue(of(undefined));

      component.deleteAccount();

      expect(mockAccountService.deleteAccount).toHaveBeenCalled();
    });

    it('should set deleting state to true while deleting', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);

      const deleteSubject = new Subject<void>();
      mockAccountService.deleteAccount.mockReturnValue(deleteSubject.asObservable());

      component.deleteAccount();
      fixture.detectChanges();

      expect(component.isDeletingAccount).toBe(true);

      deleteSubject.next();
      deleteSubject.complete();
      expect(component.isDeletingAccount).toBe(false);
    });

    it('should show success message after successful deletion', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      mockAccountService.deleteAccount.mockReturnValue(of(undefined));

      component.deleteAccount();

      expect(alertSpy).toHaveBeenCalledWith('Your account has been deleted successfully.');

      alertSpy.mockRestore();
    });

    it('should logout after successful deletion', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      jest.spyOn(window, 'alert').mockImplementation();
      const logoutSpy = jest.spyOn(component, 'logout');
      mockAccountService.deleteAccount.mockReturnValue(of(undefined));

      component.deleteAccount();

      expect(logoutSpy).toHaveBeenCalled();
    });

    it('should reset deleting state after successful deletion', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      jest.spyOn(window, 'alert').mockImplementation();
      mockAccountService.deleteAccount.mockReturnValue(of(undefined));

      component.deleteAccount();

      expect(component.isDeletingAccount).toBe(false);
    });

    it('should handle delete error gracefully', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      mockAccountService.deleteAccount.mockReturnValue(
        throwError(() => ({ error: { message: 'Failed to delete' } }))
      );

      component.deleteAccount();

      expect(alertSpy).toHaveBeenCalledWith('Failed to delete');
      expect(component.isDeletingAccount).toBe(false);

      alertSpy.mockRestore();
    });

    it('should show generic error message when error format is unexpected', () => {
      jest.spyOn(window, 'confirm').mockReturnValue(true);
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation();
      mockAccountService.deleteAccount.mockReturnValue(throwError(() => ({ status: 500 })));

      component.deleteAccount();

      expect(alertSpy).toHaveBeenCalledWith('Failed to delete account. Please try again.');

      alertSpy.mockRestore();
    });

    it('should disable delete button while deleting', () => {
      component.isDeletingAccount = true;
      fixture.detectChanges();

      const deleteButton = compiled.querySelector('.delete-account-btn') as HTMLButtonElement;
      expect(deleteButton.disabled).toBe(true);
    });

    it('should show "Deleting..." text while deleting', () => {
      component.isDeletingAccount = true;
      fixture.detectChanges();

      const deleteButton = compiled.querySelector('.delete-account-btn');
      expect(deleteButton!.textContent).toContain('Deleting...');
    });

    it('should show "Delete Account" text when not deleting', () => {
      component.isDeletingAccount = false;
      fixture.detectChanges();

      const deleteButton = compiled.querySelector('.delete-account-btn');
      expect(deleteButton!.textContent).toContain('Delete Account');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper ARIA labels on settings button', () => {
      const settingsButton = fixture.debugElement.query(By.css('.settings-btn'));
      expect(settingsButton.nativeElement.getAttribute('aria-label')).toBe('Open settings');
    });

    it('should have proper role on modal', () => {
      component.isSettingsModalOpen = true;
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('.settings-modal'));
      expect(modal.nativeElement.getAttribute('role')).toBe('dialog');
    });

    it('should have aria-modal on modal', () => {
      component.isSettingsModalOpen = true;
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('.settings-modal'));
      expect(modal.nativeElement.getAttribute('aria-modal')).toBe('true');
    });
  });
});
