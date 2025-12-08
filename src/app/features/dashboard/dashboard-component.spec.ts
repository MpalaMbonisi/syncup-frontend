import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard-component';
import { ROUTES, STORAGE_KEYS } from '../../core/constants/app.constants';
import { provideRouter, Router } from '@angular/router';
import { JwtDecoderService } from '../../core/services/jwt-decoder-service';
import { TaskListResponseDTO, TaskListService } from '../../core/services/task-list-service';
import { of, Subject } from 'rxjs';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let router: jasmine.SpyObj<Router>;
  let jwtDecoder: jasmine.SpyObj<JwtDecoderService>;
  let taskListService: jasmine.SpyObj<TaskListService>;

  const mockValidUser = {
    username: 'johndoe',
    issuedAt: new Date(),
    expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
    isExpired: false,
  };

  const mockExpiredUser = {
    username: 'johndoe',
    issuedAt: new Date(Date.now() - 7200000),
    expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
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
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const jwtDecoderSpy = jasmine.createSpyObj('JwtDecoderService', ['getUserFromToken']);
    const taskListServiceSpy = jasmine.createSpyObj('TaskListService', ['getAllLists']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: JwtDecoderService, useValue: jwtDecoderSpy },
        { provide: TaskListService, useValue: taskListServiceSpy },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    jwtDecoder = TestBed.inject(JwtDecoderService) as jasmine.SpyObj<JwtDecoderService>;
    taskListService = TestBed.inject(TaskListService) as jasmine.SpyObj<TaskListService>;

    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    taskListService.getAllLists.and.returnValue(of([]));
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('User Authentication', () => {
    it('should load user info from token on init', () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
      jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);
      taskListService.getAllLists.and.returnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(jwtDecoder.getUserFromToken).toHaveBeenCalledWith('mock-token-12345');
      expect(component.username).toBe('Johndoe');
    });

    it('should capitalize first letter of username', () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
      jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);
      taskListService.getAllLists.and.returnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.username).toBe('Johndoe');
    });

    it('should redirect to login if no token exists', () => {
      jwtDecoder.getUserFromToken.and.returnValue(null);
      taskListService.getAllLists.and.returnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should redirect to login if token cannot be decoded', () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'invalid-token');
      jwtDecoder.getUserFromToken.and.returnValue(null);
      taskListService.getAllLists.and.returnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(jwtDecoder.getUserFromToken).toHaveBeenCalledWith('invalid-token');
      expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should redirect to login if token is expired', () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'expired-token');
      jwtDecoder.getUserFromToken.and.returnValue(mockExpiredUser);
      taskListService.getAllLists.and.returnValue(of([]));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.isTokenExpired).toBeTrue();
      expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });

    it('should store user data in localStorage', () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
      jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);
      taskListService.getAllLists.and.returnValue(of([]));

      spyOn(localStorage, 'setItem');

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_DATA,
        jasmine.any(String)
      );
    });
  });

  describe('Task Lists Loading', () => {
    // Subject to control when the observable emits
    let taskListSubject: Subject<TaskListResponseDTO[]>;

    beforeEach(() => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
      jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);

      // Initialize the subject before each test in this describe block
      taskListSubject = new Subject<TaskListResponseDTO[]>();
      // Mock the service call to return the subject, keeping the observable open
      taskListService.getAllLists.and.returnValue(taskListSubject.asObservable());

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      // NOTE: detectChanges() here triggers ngOnInit and starts the loading process,
      // setting isLoading=true, but the subscription will not complete yet.
      fixture.detectChanges();
    });

    it('should load task lists on init', () => {
      // Complete the observable to deliver the data
      taskListSubject.next(mockTaskLists);
      taskListSubject.complete();
      fixture.detectChanges();

      expect(taskListService.getAllLists).toHaveBeenCalled();
      expect(component.taskLists).toEqual(mockTaskLists);
      expect(component.taskLists.length).toBe(2);
    });

    it('should set isLoading to true while loading (FIXED)', () => {
      expect(component.isLoading).toBeTrue();

      // Clean up: complete the observable so the component resets isLoading
      taskListSubject.next(mockTaskLists);
      taskListSubject.complete();
    });

    it('should set isLoading to false after loading completes', () => {
      // The test setup in beforeEach started loading, so it is currently TRUE.
      expect(component.isLoading).toBeTrue(); // Sanity check before completion

      // Complete the observable
      taskListSubject.next(mockTaskLists);
      taskListSubject.complete();
      fixture.detectChanges(); // Run change detection to see the change

      expect(component.isLoading).toBeFalse();
    });

    it('should display empty array when user has no lists', () => {
      // Complete the observable with an empty array
      taskListSubject.next([]);
      taskListSubject.complete();
      fixture.detectChanges();

      expect(component.taskLists).toEqual([]);
      expect(component.taskLists.length).toBe(0);
    });

    it('should handle error when loading task lists fails', () => {
      const mockError = { status: 500, message: 'Server error' };

      // Error the observable
      taskListSubject.error(mockError);
      fixture.detectChanges();

      expect(component.errorMessage).toBe('Failed to load task lists. Please try again.');
      expect(component.isLoading).toBeFalse();
    });

    it('should redirect to login on 401 error', () => {
      const mockError = { status: 401, message: 'Unauthorized' };

      // Error the observable
      taskListSubject.error(mockError);
      fixture.detectChanges();

      expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
    });
  });

  describe('Task Statistics', () => {
    beforeEach(() => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
      jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);
      taskListService.getAllLists.and.returnValue(of(mockTaskLists));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should calculate incomplete task count correctly', () => {
      const list = mockTaskLists[0]; // Shopping List: 1 incomplete, 1 complete
      const incompleteCount = component.getIncompleteTaskCount(list);

      expect(incompleteCount).toBe(1);
    });

    it('should calculate completed task count correctly', () => {
      const list = mockTaskLists[0]; // Shopping List: 1 incomplete, 1 complete
      const completedCount = component.getCompletedTaskCount(list);

      expect(completedCount).toBe(1);
    });

    it('should return 0 for incomplete tasks when all tasks are completed', () => {
      const allCompletedList: TaskListResponseDTO = {
        id: 3,
        title: 'Completed List',
        owner: 'johndoe',
        collaborators: [],
        tasks: [
          { id: 4, description: 'Task 1', completed: true, taskListTitle: 'Completed List' },
          { id: 5, description: 'Task 2', completed: true, taskListTitle: 'Completed List' },
        ],
      };

      const incompleteCount = component.getIncompleteTaskCount(allCompletedList);
      expect(incompleteCount).toBe(0);
    });

    it('should return 0 for completed tasks when all tasks are incomplete', () => {
      const allIncompleteList: TaskListResponseDTO = {
        id: 3,
        title: 'Incomplete List',
        owner: 'johndoe',
        collaborators: [],
        tasks: [
          { id: 4, description: 'Task 1', completed: false, taskListTitle: 'Incomplete List' },
          { id: 5, description: 'Task 2', completed: false, taskListTitle: 'Incomplete List' },
        ],
      };

      const completedCount = component.getCompletedTaskCount(allIncompleteList);
      expect(completedCount).toBe(0);
    });

    it('should handle lists with no tasks', () => {
      const emptyList: TaskListResponseDTO = {
        id: 3,
        title: 'Empty List',
        owner: 'johndoe',
        collaborators: [],
        tasks: [],
      };

      const incompleteCount = component.getIncompleteTaskCount(emptyList);
      const completedCount = component.getCompletedTaskCount(emptyList);

      expect(incompleteCount).toBe(0);
      expect(completedCount).toBe(0);
    });
  });

  describe('Ownership Check', () => {
    beforeEach(() => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-token-12345');
      jwtDecoder.getUserFromToken.and.returnValue(mockValidUser);
      taskListService.getAllLists.and.returnValue(of(mockTaskLists));

      fixture = TestBed.createComponent(DashboardComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should return true when user is the owner', () => {
      const list = mockTaskLists[0]; // owner: 'johndoe'
      const isOwner = component.isOwner(list);

      expect(isOwner).toBeTrue();
    });

    it('should return false when user is not the owner', () => {
      const collaboratorList: TaskListResponseDTO = {
        id: 3,
        title: 'Team List',
        owner: 'janedoe',
        collaborators: ['johndoe'],
        tasks: [],
      };

      const isOwner = component.isOwner(collaboratorList);
      expect(isOwner).toBeFalse();
    });

    it('should handle case-insensitive username comparison', () => {
      const list: TaskListResponseDTO = {
        id: 3,
        title: 'Test List',
        owner: 'JOHNDOE',
        collaborators: [],
        tasks: [],
      };

      const isOwner = component.isOwner(list);
      expect(isOwner).toBeTrue();
    });
  });
});
