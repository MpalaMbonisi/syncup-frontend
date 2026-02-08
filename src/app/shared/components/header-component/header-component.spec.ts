import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header-component';
import { provideRouter, Router } from '@angular/router';
import { AccountService, UserResponseDTO } from '../../../core/services/account-service';
import { of } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  // let router: jasmine.SpyObj<Router>;
  let accountService: jasmine.SpyObj<AccountService>;
  // let compiled: HTMLElement;

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

    // router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    accountService = TestBed.inject(AccountService) as jasmine.SpyObj<AccountService>;

    // Default successful response for account details
    accountService.getAccountDetails.and.returnValue(of(mockAccountDetails));

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    // compiled = fixture.nativeElement;
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
});
