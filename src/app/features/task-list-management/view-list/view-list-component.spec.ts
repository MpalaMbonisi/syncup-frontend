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

  describe('Task Display', () => {
    it('should display all tasks', () => {
      const taskItems = fixture.nativeElement.querySelectorAll('.task-item');
      expect(taskItems.length).toBe(2);
    });

    it('should show completed task with strikethrough', () => {
      const completedTask = fixture.nativeElement.querySelectorAll('.task-item')[1];
      expect(completedTask.classList.contains('completed')).toBe(true);
    });

    it('should show incomplete task without strikethrough', () => {
      const incompleteTask = fixture.nativeElement.querySelectorAll('.task-item')[0];
      expect(incompleteTask.classList.contains('completed')).toBe(false);
    });

    it('should display task descriptions', () => {
      const taskDescriptions = fixture.nativeElement.querySelectorAll('.task-description');
      expect(taskDescriptions[0].textContent).toContain('Buy milk');
      expect(taskDescriptions[1].textContent).toContain('Buy bread');
    });
  });

  describe('Task Creation', () => {
    it('should have add task input', () => {
      const input = fixture.nativeElement.querySelector('.add-task-input');
      expect(input).toBeTruthy();
    });

    it('should create task when form is submitted', () => {
      const newTask = {
        id: 3,
        description: 'Buy eggs',
        completed: false,
        taskListTitle: 'Shopping List',
      };
      mockTaskService.createTask.mockReturnValue(of(newTask));

      component.newTaskDescription = 'Buy eggs';
      component.addTask();

      expect(mockTaskService.createTask).toHaveBeenCalledWith(1, { description: 'Buy eggs' });
    });

    it('should clear input after task creation', () => {
      const newTask = {
        id: 3,
        description: 'Buy eggs',
        completed: false,
        taskListTitle: 'Shopping List',
      };
      mockTaskService.createTask.mockReturnValue(of(newTask));

      component.newTaskDescription = 'Buy eggs';
      component.addTask();

      expect(component.newTaskDescription).toBe('');
    });

    it('should add new task to list', () => {
      const newTask = {
        id: 3,
        description: 'Buy eggs',
        completed: false,
        taskListTitle: 'Shopping List',
      };
      mockTaskService.createTask.mockReturnValue(of(newTask));

      const initialLength = component.list!.tasks!.length;
      component.newTaskDescription = 'Buy eggs';
      component.addTask();

      expect(component.list!.tasks!.length).toBe(initialLength + 1);
    });

    it('should not create task with empty description', () => {
      component.newTaskDescription = '';
      component.addTask();

      expect(mockTaskService.createTask).not.toHaveBeenCalled();
    });

    it('should not create task with whitespace-only description', () => {
      component.newTaskDescription = '   ';
      component.addTask();

      expect(mockTaskService.createTask).not.toHaveBeenCalled();
    });
  });
});
