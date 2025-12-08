import { TestBed } from '@angular/core/testing';

import { TaskListResponseDTO, TaskListService } from './task-list-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';

describe('TaskListService', () => {
  let service: TaskListService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TaskListService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TaskListService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllLists', () => {
    it('should return an empty array when user has no lists', () => {
      const mockResponse: TaskListResponseDTO[] = [];
      service.getAllLists().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/all`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return all task lists for the user', () => {
      const mockResponse = [
        {
          id: 1,
          title: 'Shopping List',
          owner: 'mbonisimpala',
          collaborators: [],
          tasks: [
            {
              id: 1,
              description: 'Buy milk',
              completed: false,
              taskListTitle: 'Shopping List',
            },
          ],
        },
        {
          id: 2,
          title: 'Work Tasks',
          owner: 'mbonisimpala',
          collaborators: ['johnsmith'],
          tasks: [],
        },
      ];

      service.getAllLists().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.length).toBe(2);
        expect(response[0].title).toBe('Shopping List');
        expect(response[1].title).toBe('Work Tasks');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/all`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return lists when user is collaborator', () => {
      const mockResponse = [
        {
          id: 1,
          title: 'Team Project',
          owner: 'johnsmith',
          collaborators: ['mbonisimpala', 'nicolencube'],
          tasks: [],
        },
      ];

      service.getAllLists().subscribe(response => {
        expect(response.length).toBe(1);
        expect(response[0].collaborators).toContain('mbonisimpala');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/all`);
      req.flush(mockResponse);
    });

    it('should return lists with tasks and their completion status', () => {
      const mockResponse = [
        {
          id: 1,
          title: 'Shopping List',
          owner: 'mbonisimpala',
          collaborators: [],
          tasks: [
            {
              id: 1,
              description: 'Buy milk',
              completed: false,
              taskListTitle: 'Shopping List',
            },
            {
              id: 2,
              description: 'Buy bread',
              completed: true,
              taskListTitle: 'Shopping List',
            },
          ],
        },
      ];

      service.getAllLists().subscribe(response => {
        expect(response[0].tasks.length).toBe(2);
        expect(response[0].tasks[0].completed).toBeFalse();
        expect(response[0].tasks[1].completed).toBeTrue();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/all`);
      req.flush(mockResponse);
    });

    it('should handle error when API call fails', () => {
      const mockError = { message: 'Network Error' };

      service.getAllLists().subscribe({
        next: () => fail('should have failed with network error'),
        error: error => {
          expect(error.status).toBe(500);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/all`);
      req.flush(mockError, { status: 500, statusText: 'Server Error' });
    });

    it('should handle 401 unauthorised error', () => {
      const mockError = { message: 'User is unauthorised! Authentication Failed!' };

      service.getAllLists().subscribe({
        next: () => fail('should have failed with 401 error'),
        error: error => {
          expect(error.status).toBe(401);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/all`);
      req.flush(mockError, { status: 401, statusText: 'Unauthorized' });
    });
  });
});
