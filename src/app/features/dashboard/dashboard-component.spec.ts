import { DashboardComponent } from './dashboard-component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListService } from '../../core/services/task-list-service';
import { provideRouter, Router } from '@angular/router';
import { JwtDecoderService } from '../../core/services/jwt-decoder-service';
import { of } from 'rxjs';
import { ROUTES, STORAGE_KEYS } from '../../core/constants/app.constants';
import { StorageService } from '../../core/services/storage-service';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockRouter: { navigate: jest.Mock };
  let mockJwtDecoder: { getUserFromToken: jest.Mock };
  let mockTaskListService: { getAllLists: jest.Mock };
  let mockStorageService: {
    getItem: jest.Mock;
    setItem: jest.Mock;
    removeItem: jest.Mock;
    clear: jest.Mock;
  };

  const mockValidUser = {
    username: 'johndoe',
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000),
    isExpired: false,
  };

  const mockExpiredUser = {
    username: 'johndoe',
    issuedAt: new Date(Date.now() - 7200000),
    expiresAt: new Date(Date.now() - 3600000),
    isExpired: true,
  };

  beforeEach(async () => {
    mockRouter = { navigate: jest.fn() };
    mockJwtDecoder = { getUserFromToken: jest.fn() };
    mockTaskListService = { getAllLists: jest.fn() };
    mockStorageService = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: JwtDecoderService, useValue: mockJwtDecoder },
        { provide: TaskListService, useValue: mockTaskListService },
        { provide: StorageService, useValue: mockStorageService },
        provideRouter([]),
      ],
    }).compileComponents();
  });

  it('should create', () => {
    mockTaskListService.getAllLists.mockReturnValue(of([]));
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('User Authentication', () => {
    beforeEach(() => {
      // Default setup for successful token retrieval
      mockStorageService.getItem.mockImplementation((key: string) => {
        return key === STORAGE_KEYS.AUTH_TOKEN ? 'mock-token-12345' : null;
      });
    });

    it('should load user info from token on init', () => {
      mockJwtDecoder.getUserFromToken.mockReturnValue(mockValidUser);
      mockTaskListService.getAllLists.mockReturnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockJwtDecoder.getUserFromToken).toHaveBeenCalledWith('mock-token-12345');
      expect(component.username).toBe('Johndoe');
    });

    it('should capitalize first letter of username', () => {
      mockJwtDecoder.getUserFromToken.mockReturnValue(mockValidUser);
      mockTaskListService.getAllLists.mockReturnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.username).toBe('Johndoe');
    });

    it('should redirect to login if no token exists', () => {
      mockStorageService.getItem.mockReturnValue(null);
      mockTaskListService.getAllLists.mockReturnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should redirect to login if token cannot be decoded', () => {
      mockStorageService.getItem.mockReturnValue('invalid-token');
      mockJwtDecoder.getUserFromToken.mockReturnValue(null);
      mockTaskListService.getAllLists.mockReturnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockJwtDecoder.getUserFromToken).toHaveBeenCalledWith('invalid-token');
      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should redirect to login if token is expired', () => {
      mockStorageService.getItem.mockReturnValue('expired-token');
      mockJwtDecoder.getUserFromToken.mockReturnValue(mockExpiredUser);
      mockTaskListService.getAllLists.mockReturnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.isTokenExpired).toBe(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should store user data in StorageService', () => {
      mockJwtDecoder.getUserFromToken.mockReturnValue(mockValidUser);
      mockTaskListService.getAllLists.mockReturnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_DATA,
        expect.any(String)
      );
    });
  });
});
