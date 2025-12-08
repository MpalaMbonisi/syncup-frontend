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

  describe('getListById', () => {
    it('should return a specific task list by ID', () => {
      const listId = 1;
      const mockResponse = {
        id: listId,
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
      };

      service.getListById(listId).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.id).toBe(listId);
        expect(response.title).toBe('Shopping List');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should handle 404 error when list does not exist', () => {
      const listId = 999;
      const mockError = { message: "List not found or you don't have access to it!" };

      service.getListById(listId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: error => {
          expect(error.status).toBe(404);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}`);
      req.flush(mockError, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 403 error when user does not have access', () => {
      const listId = 1;
      const mockError = { message: "List not found or you don't have access to it!" };

      service.getListById(listId).subscribe({
        next: () => fail('should have failed with 403 error'),
        error: error => {
          expect(error.status).toEqual(403);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}`);
      req.flush(mockError, { status: 403, statusText: 'Forbidden' });
    });
  });

  describe('createList', () => {
    it('should create a new task list successfully', () => {
      const newList = { title: 'New Shopping List' };
      const mockResponse = {
        id: 1,
        title: 'New Shopping List',
        owner: 'mbonisimpala',
        collaborators: [],
        tasks: [],
      };

      service.createList(newList).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.title).toBe(newList.title);
        expect(response.id).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/create`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newList);
      req.flush(mockResponse);
    });

    it('should handle 409 conflict error when duplicate title exists', () => {
      const newList = { title: 'Shopping List' };
      const mockError = { message: 'You already have a list with this title!' };

      service.createList(newList).subscribe({
        next: () => fail('should have failed with 409 error'),
        error: error => {
          expect(error.status).toBe(409);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/create`);
      req.flush(mockError, { status: 409, statusText: 'Conflict' });
    });

    it('should handle 400 bad request when title is empty', () => {
      const newList = { title: '' };
      const mockError = { message: ['Title cannot be empty.'] };

      service.createList(newList).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: error => {
          expect(error.status).toBe(400);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/create`);
      req.flush(mockError, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 400 bad request when title is blank', () => {
      const newList = { title: '     ' };
      const mockError = { message: ['Title cannot be blank.'] };

      service.createList(newList).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: error => {
          expect(error.status).toBe(400);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/create`);
      req.flush(mockError, { status: 400, statusText: 'Bad Request' });
    });
  });
});
