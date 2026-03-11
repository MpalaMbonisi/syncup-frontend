import { TestBed } from '@angular/core/testing';

import { CollaboratorsService } from './collaborators-service';
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
});
