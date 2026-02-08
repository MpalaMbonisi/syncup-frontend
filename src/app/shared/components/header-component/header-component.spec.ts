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
});
