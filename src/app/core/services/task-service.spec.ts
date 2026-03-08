import { TestBed } from '@angular/core/testing';

import {
  TaskCreateDTO,
  TaskService,
  TaskUpdateDescriptionDTO,
  TaskUpdateStatusDTO,
} from './task-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createTask', () => {
    it('should create a new task', () => {
      const listId = 1;
      const taskData: TaskCreateDTO = { description: 'New task' };
      const mockResponse = {
        id: 1,
        description: 'New task',
        completed: false,
        taskListTitle: 'My List',
      };

      service.createTask(listId, taskData).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.id).toBe(1);
        expect(response.description).toBe('New task');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}/task/create`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(taskData);
      req.flush(mockResponse);
    });

    it('should handle 400 error when description is empty', () => {
      const listId = 1;
      const taskData: TaskCreateDTO = { description: '' };
      const mockError = { message: ['Description cannot be empty.'] };

      service.createTask(listId, taskData).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: error => {
          expect(error.status).toBe(400);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}/task/create`);
      req.flush(mockError, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getTaskById', () => {
    it('should fetch a task by ID', () => {
      const listId = 1;
      const taskId = 1;
      const mockResponse = {
        id: 1,
        description: 'Test task',
        completed: false,
        taskListTitle: 'My List',
      };

      service.getTaskById(listId, taskId).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}/task/${taskId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle 404 error when task not found', () => {
      const listId = 1;
      const taskId = 999;
      const mockError = { message: 'Task not found' };

      service.getTaskById(listId, taskId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: error => {
          expect(error.status).toBe(404);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}/task/${taskId}`);
      req.flush(mockError, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task status', () => {
      const listId = 1;
      const taskId = 1;
      const statusData: TaskUpdateStatusDTO = { completed: true };
      const mockResponse = {
        id: 1,
        description: 'Test task',
        completed: true,
        taskListTitle: 'My List',
      };

      service.updateTaskStatus(listId, taskId, statusData).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.completed).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}/task/${taskId}/status`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(statusData);
      req.flush(mockResponse);
    });
  });

  describe('updateTaskDescription', () => {
    it('should update task description', () => {
      const listId = 1;
      const taskId = 1;
      const descriptionData: TaskUpdateDescriptionDTO = { description: 'Updated description' };
      const mockResponse = {
        id: 1,
        description: 'Updated description',
        completed: false,
        taskListTitle: 'My List',
      };

      service.updateTaskDescription(listId, taskId, descriptionData).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.description).toBe('Updated description');
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/list/${listId}/task/${taskId}/description`
      );
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(descriptionData);
      req.flush(mockResponse);
    });

    it('should handle 400 error when description is empty', () => {
      const listId = 1;
      const taskId = 1;
      const descriptionData: TaskUpdateDescriptionDTO = { description: '' };
      const mockError = { message: ['Description cannot be empty.'] };

      service.updateTaskDescription(listId, taskId, descriptionData).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: error => {
          expect(error.status).toBe(400);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(
        `${environment.apiUrl}/list/${listId}/task/${taskId}/description`
      );
      req.flush(mockError, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', () => {
      const listId = 1;
      const taskId = 1;

      service.deleteTask(listId, taskId).subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}/task/${taskId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should handle 404 error when task not found', () => {
      const listId = 1;
      const taskId = 999;
      const mockError = { message: 'Task not found' };

      service.deleteTask(listId, taskId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: error => {
          expect(error.status).toBe(404);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}/task/${taskId}`);
      req.flush(mockError, { status: 404, statusText: 'Not Found' });
    });
  });
});
