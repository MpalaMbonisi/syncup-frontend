import { DashboardComponent } from './dashboard-component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListResponseDTO, TaskListService } from '../../core/services/task-list-service';
import { Router } from '@angular/router';
import { JwtDecoderService } from '../../core/services/jwt-decoder-service';
import { of, throwError } from 'rxjs';
import { ROUTES, STORAGE_KEYS } from '../../core/constants/app.constants';
import { StorageService } from '../../core/services/storage-service';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockTaskListService: {
    getAllLists: jest.Mock;
    deleteList: jest.Mock;
  };
  let mockStorageService: {
    getItem: jest.Mock;
    setItem: jest.Mock;
    removeItem: jest.Mock;
  };
  let mockJwtDecoder: {
    getUserFromToken: jest.Mock;
  };
  let mockRouter: {
    navigate: jest.Mock;
  };
  let mockCreateListModal: {
    open: jest.Mock;
  };
  let mockManageCollaboratorsModal: {
    open: jest.Mock;
  };
  let mockDuplicateListModal: {
    open: jest.Mock;
  };

  const mockUser = {
    username: 'johndoe',
    issuedAt: new Date('2024-01-01'),
    expiresAt: new Date('2024-12-31'),
    isExpired: false,
  };

  const mockTaskLists: TaskListResponseDTO[] = [
    {
      id: 1,
      title: 'Shopping List',
      owner: 'johndoe',
      collaborators: ['janedoe', 'bobsmith'],
      tasks: [
        { id: 1, description: 'Buy milk', completed: false, taskListTitle: 'Shopping List' },
        { id: 2, description: 'Buy bread', completed: true, taskListTitle: 'Shopping List' },
      ],
    },
    {
      id: 2,
      title: 'Work Tasks',
      owner: 'janedoe',
      collaborators: [],
      tasks: [{ id: 3, description: 'Review PR', completed: false, taskListTitle: 'Work Tasks' }],
    },
    {
      id: 3,
      title: 'Empty List',
      owner: 'johndoe',
      collaborators: [],
      tasks: [],
    },
  ];

  beforeEach(async () => {
    mockTaskListService = {
      getAllLists: jest.fn().mockReturnValue(of([])),
      deleteList: jest.fn(),
    };

    mockStorageService = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    mockJwtDecoder = {
      getUserFromToken: jest.fn(),
    };

    mockRouter = {
      navigate: jest.fn(),
    };

    mockCreateListModal = {
      open: jest.fn(),
    };

    mockManageCollaboratorsModal = {
      open: jest.fn(),
    };

    mockDuplicateListModal = {
      open: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: TaskListService, useValue: mockTaskListService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: JwtDecoderService, useValue: mockJwtDecoder },
        { provide: Router, useValue: mockRouter },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    component.createListModal = mockCreateListModal as unknown as typeof component.createListModal;
    component.manageCollaboratorsModal =
      mockManageCollaboratorsModal as unknown as typeof component.manageCollaboratorsModal;
    component.duplicateListModal =
      mockDuplicateListModal as unknown as typeof component.duplicateListModal;
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.username).toBe('');
      expect(component.isTokenExpired).toBe(false);
      expect(component.taskLists).toEqual([]);
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('');
      expect(component.viewMode).toBe('grid');
    });

    it('should load user info and task lists on init', () => {
      mockStorageService.getItem.mockReturnValue('valid-token');
      mockJwtDecoder.getUserFromToken.mockReturnValue(mockUser);
      mockTaskListService.getAllLists.mockReturnValue(of(mockTaskLists));

      component.ngOnInit();

      expect(mockStorageService.getItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
      expect(mockJwtDecoder.getUserFromToken).toHaveBeenCalledWith('valid-token');
      expect(mockTaskListService.getAllLists).toHaveBeenCalled();
    });
  });

  describe('User Authentication', () => {
    it('should load user info from token', () => {
      mockStorageService.getItem.mockReturnValue('valid-token');
      mockJwtDecoder.getUserFromToken.mockReturnValue(mockUser);
      mockTaskListService.getAllLists.mockReturnValue(of([]));

      component.ngOnInit();

      expect(component.username).toBe('Johndoe');
      expect(component.isTokenExpired).toBe(false);
      expect(mockStorageService.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_DATA,
        expect.any(String)
      );
    });

    it('should logout if no token found', () => {
      mockStorageService.getItem.mockReturnValue(null);

      component.ngOnInit();

      expect(mockStorageService.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.AUTH_TOKEN);
      expect(mockStorageService.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.USER_DATA);
      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should logout if token is expired', () => {
      mockStorageService.getItem.mockReturnValue('expired-token');
      mockJwtDecoder.getUserFromToken.mockReturnValue({ ...mockUser, isExpired: true });

      component.ngOnInit();

      expect(component.isTokenExpired).toBe(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should logout if token decoding fails', () => {
      mockStorageService.getItem.mockReturnValue('invalid-token');
      mockJwtDecoder.getUserFromToken.mockReturnValue(null);

      component.ngOnInit();

      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });
  });

  describe('Load Task Lists', () => {
    beforeEach(() => {
      mockStorageService.getItem.mockReturnValue('valid-token');
      mockJwtDecoder.getUserFromToken.mockReturnValue(mockUser);
    });

    it('should load task lists successfully', () => {
      mockTaskListService.getAllLists.mockReturnValue(of(mockTaskLists));

      component.loadTaskLists();

      expect(component.isLoading).toBe(false);
      expect(component.taskLists).toEqual(mockTaskLists);
      expect(component.errorMessage).toBe('');
    });

    it('should set loading state while fetching lists', () => {
      mockTaskListService.getAllLists.mockReturnValue(of(mockTaskLists));

      component.isLoading = false;
      component.loadTaskLists();

      expect(component.isLoading).toBe(false); // After subscription completes
    });

    it('should handle error when loading lists fails', () => {
      const error = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
      mockTaskListService.getAllLists.mockReturnValue(throwError(() => error));

      component.loadTaskLists();

      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('Failed to load task lists. Please try again.');
    });

    it('should logout on 401 error', () => {
      const error = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
      mockTaskListService.getAllLists.mockReturnValue(throwError(() => error));

      component.loadTaskLists();

      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should handle empty task lists array', () => {
      mockTaskListService.getAllLists.mockReturnValue(of([]));

      component.loadTaskLists();

      expect(component.taskLists).toEqual([]);
      expect(component.isLoading).toBe(false);
    });
  });

  describe('Task Statistics', () => {
    beforeEach(() => {
      component.taskLists = mockTaskLists;
    });

    it('should calculate incomplete task count for a list', () => {
      const count = component.getIncompleteTaskCount(mockTaskLists[0]);
      expect(count).toBe(1); // Only 'Buy milk' is incomplete
    });

    it('should calculate completed task count for a list', () => {
      const count = component.getCompletedTaskCount(mockTaskLists[0]);
      expect(count).toBe(1); // Only 'Buy bread' is completed
    });

    it('should handle lists with null tasks array', () => {
      const listWithNullTasks = {
        ...mockTaskLists[0],
        tasks: null as unknown as TaskListResponseDTO['tasks'],
      };
      const incompleteCount = component.getIncompleteTaskCount(listWithNullTasks);
      const completedCount = component.getCompletedTaskCount(listWithNullTasks);

      expect(incompleteCount).toBe(0);
      expect(completedCount).toBe(0);
    });

    it('should calculate total completed tasks across all lists', () => {
      const total = component.getTotalCompletedTasks();
      expect(total).toBe(1); // 1 from Shopping List + 0 from others
    });

    it('should calculate total pending tasks across all lists', () => {
      const total = component.getTotalPendingTasks();
      expect(total).toBe(2); // 1 from Shopping List + 1 from Work Tasks
    });

    it('should calculate total collaborations (lists where user is not owner)', () => {
      component.username = 'Johndoe';
      const total = component.getTotalCollaborations();
      expect(total).toBe(1);
    });
  });

  describe('Ownership Detection', () => {
    beforeEach(() => {
      component.username = 'Johndoe';
    });

    it('should detect when user is the owner', () => {
      const isOwner = component.isOwner(mockTaskLists[0]); // owned by johndoe
      expect(isOwner).toBe(true);
    });

    it('should detect when user is not the owner', () => {
      const isOwner = component.isOwner(mockTaskLists[1]); // owned by janedoe
      expect(isOwner).toBe(false);
    });

    it('should handle case-insensitive username comparison', () => {
      component.username = 'JOHNDOE';
      const isOwner = component.isOwner(mockTaskLists[0]);
      expect(isOwner).toBe(true);
    });
  });

  describe('View Mode', () => {
    it('should default to grid view', () => {
      expect(component.viewMode).toBe('grid');
    });

    it('should set view mode to list', () => {
      component.setViewMode('list');
      expect(component.viewMode).toBe('list');
      expect(mockStorageService.setItem).toHaveBeenCalledWith('dashboardViewMode', 'list');
    });

    it('should set view mode to grid', () => {
      component.setViewMode('grid');
      expect(component.viewMode).toBe('grid');
      expect(mockStorageService.setItem).toHaveBeenCalledWith('dashboardViewMode', 'grid');
    });

    it('should load saved view preference on init', () => {
      mockStorageService.getItem.mockImplementation((key: string) => {
        if (key === 'dashboardViewMode') return 'list';
        if (key === STORAGE_KEYS.AUTH_TOKEN) return 'valid-token';
        return null;
      });
      mockJwtDecoder.getUserFromToken.mockReturnValue(mockUser);
      mockTaskListService.getAllLists.mockReturnValue(of([]));

      component.ngOnInit();

      expect(component.viewMode).toBe('list');
    });

    it('should default to grid if no saved preference', () => {
      mockStorageService.getItem.mockReturnValue(null);
      mockJwtDecoder.getUserFromToken.mockReturnValue(mockUser);
      mockTaskListService.getAllLists.mockReturnValue(of([]));

      component.ngOnInit();

      expect(component.viewMode).toBe('grid');
    });
  });

  describe('Navigation', () => {
    it('should navigate to list view', () => {
      component.viewList(mockTaskLists[0]);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/list', 1]);
    });

    it('should navigate to list view when editing title', () => {
      component.editListTitle(mockTaskLists[0]);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/list', 1]);
    });
  });
});
