import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewListComponent } from './view-list-component';
import { Observable, of } from 'rxjs';
import { TaskListResponseDTO, TaskListService } from '../../../core/services/task-list-service';
import { TaskService } from '../../../core/services/task-service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ViewListComponent', () => {
  let component: ViewListComponent;
  let fixture: ComponentFixture<ViewListComponent>;

  let mockTaskListService: {
    getListById: jest.Mock;
    updateListTitle: jest.Mock;
    deleteList: jest.Mock;
  };
  let mockTaskService: {
    createTask: jest.Mock;
    updateTaskStatus: jest.Mock;
    updateTaskDescription: jest.Mock;
    deleteTask: jest.Mock;
  };
  let mockRouter: { navigate: jest.Mock };
  let mockActivatedRoute: {
    params: Observable<Params>;
    snapshot: { params: Params };
  };

  const mockList: TaskListResponseDTO = {
    id: 1,
    title: 'Shopping List',
    owner: 'johndoe',
    collaborators: ['janedoe'],
    tasks: [
      { id: 1, description: 'Buy milk', completed: false, taskListTitle: 'Shopping List' },
      { id: 2, description: 'Buy bread', completed: true, taskListTitle: 'Shopping List' },
    ],
  };

  beforeEach(async () => {
    mockTaskListService = {
      getListById: jest.fn(),
      updateListTitle: jest.fn(),
      deleteList: jest.fn(),
    };

    mockTaskService = {
      createTask: jest.fn(),
      updateTaskStatus: jest.fn(),
      updateTaskDescription: jest.fn(),
      deleteTask: jest.fn(),
    };

    mockRouter = { navigate: jest.fn() };

    mockActivatedRoute = {
      params: of({ id: '1' }),
      snapshot: { params: { id: '1' } },
    };

    await TestBed.configureTestingModule({
      imports: [ViewListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TaskListService, useValue: mockTaskListService },
        { provide: TaskService, useValue: mockTaskService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    mockTaskListService.getListById.mockReturnValue(of(mockList));

    fixture = TestBed.createComponent(ViewListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load list on init', () => {
      expect(mockTaskListService.getListById).toHaveBeenCalledWith(1);
      expect(component.list).toEqual(mockList);
    });

    it('should set loading state while fetching list', () => {
      expect(component.isLoading).toBe(false);
    });

    it('should display list title', () => {
      const title = fixture.nativeElement.querySelector('.list-title');
      expect(title.textContent).toContain('Shopping List');
    });

    it('should display owner badge', () => {
      component.currentUsername = 'johndoe';
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.badge.owner');
      expect(badge).toBeTruthy();
    });

    it('should display collaborator badge when not owner', () => {
      component.currentUsername = 'janedoe';
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.badge.collaborator');
      expect(badge).toBeTruthy();
    });
  });
});
