import { DashboardComponent } from './dashboard-component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListResponseDTO, TaskListService } from '../../core/services/task-list-service';
import { Router } from '@angular/router';
import { JwtDecoderService } from '../../core/services/jwt-decoder-service';
import { of } from 'rxjs';
import { ROUTES, STORAGE_KEYS } from '../../core/constants/app.constants';
import { StorageService } from '../../core/services/storage-service';
import { provideHttpClient } from '@angular/common/http';
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
});
