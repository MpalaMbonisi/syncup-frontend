import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header-component';
import { provideRouter, Router } from '@angular/router';
import { AccountService, UserResponseDTO } from '../../../core/services/account-service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';
import { ROUTES } from '../../../core/constants/app.constants';

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
});
