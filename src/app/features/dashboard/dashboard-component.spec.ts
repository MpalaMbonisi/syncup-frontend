import { DashboardComponent } from './dashboard-component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListResponseDTO, TaskListService } from '../../core/services/task-list-service';
import { provideRouter, Router } from '@angular/router';
import { JwtDecoderService } from '../../core/services/jwt-decoder-service';
import { of, Subject } from 'rxjs';
import { ROUTES, STORAGE_KEYS } from '../../core/constants/app.constants';
import { StorageService } from '../../core/services/storage-service';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

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

  const mockTaskLists: TaskListResponseDTO[] = [
    {
      id: 1,
      title: 'Shopping List',
      owner: 'johndoe',
      collaborators: [],
      tasks: [
        { id: 1, description: 'Buy milk', completed: false, taskListTitle: 'Shopping List' },
        { id: 2, description: 'Buy bread', completed: true, taskListTitle: 'Shopping List' },
      ],
    },
    {
      id: 2,
      title: 'Work Tasks',
      owner: 'johndoe',
      collaborators: ['janedoe'],
      tasks: [
        { id: 3, description: 'Finish report', completed: false, taskListTitle: 'Work Tasks' },
      ],
    },
  ];

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
        provideHttpClientTesting(),
        provideHttpClient(),
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

  describe('Task Lists Loading', () => {
    let taskListSubject: Subject<TaskListResponseDTO[]>;

    beforeEach(() => {
      mockStorageService.getItem.mockReturnValue('mock-token-12345');
      mockJwtDecoder.getUserFromToken.mockReturnValue(mockValidUser);

      taskListSubject = new Subject<TaskListResponseDTO[]>();
      mockTaskListService.getAllLists.mockReturnValue(taskListSubject.asObservable());

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should load task lists on init', () => {
      taskListSubject.next(mockTaskLists);
      taskListSubject.complete();
      fixture.detectChanges();

      expect(mockTaskListService.getAllLists).toHaveBeenCalled();
      expect(component.taskLists).toEqual(mockTaskLists);
      expect(component.taskLists).toHaveLength(2);
    });

    it('should set isLoading to true while loading', () => {
      expect(component.isLoading).toBe(true);
      taskListSubject.next(mockTaskLists);
      taskListSubject.complete();
    });

    it('should set isLoading to false after loading completes', () => {
      taskListSubject.next(mockTaskLists);
      taskListSubject.complete();
      fixture.detectChanges();

      expect(component.isLoading).toBe(false);
    });

    it('should handle error when loading task lists fails', () => {
      const mockError = new HttpErrorResponse({ status: 500, statusText: 'Server error' });

      taskListSubject.error(mockError);
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Failed to load task lists. Please try again.');
      expect(component.isLoading).toBe(false);
    });

    it('should redirect to login on 401 error', () => {
      const mockError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });

      taskListSubject.error(mockError);
      fixture.detectChanges();

      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });
  });

  describe('Task Statistics & Ownership', () => {
    beforeEach(() => {
      mockStorageService.getItem.mockReturnValue('mock-token-12345');
      mockJwtDecoder.getUserFromToken.mockReturnValue(mockValidUser);
      mockTaskListService.getAllLists.mockReturnValue(of(mockTaskLists));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should calculate task counts correctly', () => {
      const list = mockTaskLists[0];
      expect(component.getIncompleteTaskCount(list)).toBe(1);
      expect(component.getCompletedTaskCount(list)).toBe(1);
    });

    it('should determine ownership accurately (case-insensitive)', () => {
      const ownedList = mockTaskLists[0];
      const unownedList: TaskListResponseDTO = { ...ownedList, owner: 'janedoe' };
      const capitalizedOwnerList: TaskListResponseDTO = { ...ownedList, owner: 'JOHNDOE' };

      expect(component.isOwner(ownedList)).toBe(true);
      expect(component.isOwner(unownedList)).toBe(false);
      expect(component.isOwner(capitalizedOwnerList)).toBe(true);
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      mockStorageService.getItem.mockReturnValue('mock-token-12345');
      mockJwtDecoder.getUserFromToken.mockReturnValue(mockValidUser);
      mockTaskListService.getAllLists.mockReturnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should remove token from StorageService and navigate on logout', () => {
      component.logout();

      expect(mockStorageService.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
      expect(mockStorageService.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_DATA);
      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });
  });
});
