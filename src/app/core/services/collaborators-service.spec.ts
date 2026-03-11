import { TestBed } from '@angular/core/testing';

import { AddCollaboratorsDTO, CollaboratorsService } from './collaborators-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { provideHttpClient } from '@angular/common/http';

describe('CollaboratorsService', () => {
  let service: CollaboratorsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CollaboratorsService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CollaboratorsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllCollaborators', () => {
    it('should fetch all collaborators for a list', () => {
      const listId = 1;
      const mockResponse = ['janedoe', 'bobsmith'];

      service.getAllCollaborators(listId).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.length).toBe(2);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}/collaborator/all`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should return empty array when no collaborators', () => {
      const listId = 1;
      const mockResponse: string[] = [];

      service.getAllCollaborators(listId).subscribe(response => {
        expect(response).toEqual([]);
        expect(response.length).toBe(0);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}/collaborator/all`);
      req.flush(mockResponse);
    });

    it('should handle 404 error when list not found', () => {
      const listId = 999;
      const mockError = { message: 'List not found' };

      service.getAllCollaborators(listId).subscribe({
        next: () => fail('should have failed with 404 error'),
        error: error => {
          expect(error.status).toBe(404);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}/collaborator/all`);
      req.flush(mockError, { status: 404, statusText: 'Not Found' });
    });
  });

  describe('addCollaborators', () => {
    it('should add collaborators to a list', () => {
      const listId = 1;
      const dto: AddCollaboratorsDTO = { collaborators: ['janedoe', 'bobsmith'] };
      const mockResponse = { message: 'Collaborators added successfully' };

      service.addCollaborators(listId, dto).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}/collaborator/add`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush(mockResponse);
    });

    it('should add single collaborator', () => {
      const listId = 1;
      const dto: AddCollaboratorsDTO = { collaborators: ['janedoe'] };
      const mockResponse = { message: 'Collaborator added successfully' };

      service.addCollaborators(listId, dto).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}/collaborator/add`);
      req.flush(mockResponse);
    });

    it('should handle 400 error when username does not exist', () => {
      const listId = 1;
      const dto: AddCollaboratorsDTO = { collaborators: ['nonexistent'] };
      const mockError = { message: 'User nonexistent does not exist' };

      service.addCollaborators(listId, dto).subscribe({
        next: () => fail('should have failed with 400 error'),
        error: error => {
          expect(error.status).toBe(400);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}/collaborator/add`);
      req.flush(mockError, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 409 error when user is already a collaborator', () => {
      const listId = 1;
      const dto: AddCollaboratorsDTO = { collaborators: ['janedoe'] };
      const mockError = { message: 'User janedoe is already a collaborator' };

      service.addCollaborators(listId, dto).subscribe({
        next: () => fail('should have failed with 409 error'),
        error: error => {
          expect(error.status).toBe(409);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}/collaborator/add`);
      req.flush(mockError, { status: 409, statusText: 'Conflict' });
    });

    it('should handle 403 error when user is not the owner', () => {
      const listId = 1;
      const dto: AddCollaboratorsDTO = { collaborators: ['janedoe'] };
      const mockError = { message: 'You are not the owner of this list' };

      service.addCollaborators(listId, dto).subscribe({
        next: () => fail('should have failed with 403 error'),
        error: error => {
          expect(error.status).toBe(403);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/list/${listId}/collaborator/add`);
      req.flush(mockError, { status: 403, statusText: 'Forbidden' });
    });
  });
});
