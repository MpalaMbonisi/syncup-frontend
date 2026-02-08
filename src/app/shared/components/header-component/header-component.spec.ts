import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderComponent } from './header-component';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { ROUTES } from '../../../core/constants/app.constants';
import { AuthService } from '../../../core/services/auth-service';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isLoggedIn']);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: authSpy }],
    }).compileComponents();

    const routerInstance = TestBed.inject(Router);

    spyOn(routerInstance, 'navigate');

    router = routerInstance as jasmine.SpyObj<Router>;

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Logo Component Integration', () => {
    it('should display the logo component', () => {
      const logoElement = fixture.debugElement.query(By.css('app-logo-component'));
      expect(logoElement).toBeTruthy();
    });

    it('should render logo with small size', () => {
      const logoElement = fixture.debugElement.query(By.css('app-logo-component'));
      const logoComponent = logoElement.componentInstance;
      expect(logoComponent.size).toBe('small');
    });

    it('should navigate to dashboard when logo is clicked', () => {
      const logoContainer = fixture.debugElement.query(By.css('.logo-link'));
      logoContainer.nativeElement.click();

      expect(router.navigate).toHaveBeenCalledWith([ROUTES.DASHBOARD]);
    });
  });

  describe('Settings Button', () => {
    it('should display settings button', () => {
      const compiled = fixture.nativeElement;
      const settingsButton = compiled.querySelector('.settings-btn');

      expect(settingsButton).toBeTruthy();
      expect(settingsButton.textContent).toContain('Settings');
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
      component.username = 'nicolesmith';
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

    it('should display account information section', () => {
      const accountSection = fixture.debugElement.query(By.css('.account-info'));
      expect(accountSection).toBeTruthy();
    });

    it('should display username in account info', () => {
      const usernameDisplay = fixture.debugElement.query(By.css('.username-display'));
      expect(usernameDisplay.nativeElement.textContent).toContain('nicolesmith');
    });

    it('should display logout button', () => {
      const logoutButton = fixture.debugElement.query(By.css('.logout-btn'));
      expect(logoutButton).toBeTruthy();
      expect(logoutButton.nativeElement.textContent).toContain('Logout');
    });

    it('should display delete account button', () => {
      const deleteButton = fixture.debugElement.query(By.css('.delete-account-btn'));
      expect(deleteButton).toBeTruthy();
      expect(deleteButton.nativeElement.textContent).toContain('Delete Account');
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
