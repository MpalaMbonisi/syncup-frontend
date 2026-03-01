import { TestBed } from '@angular/core/testing';

import { AccountService, UserResponseDTO } from './account-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { authInterceptor } from '../interceptors/auth-interceptor';
import { HTTP_HEADERS, STORAGE_KEYS } from '../constants/app.constants';

describe('AccountService', () => {
  let service: AccountService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AccountService,
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AccountService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('getAccountDetails', () => {
    it('should fetch account details successfully', () => {
      const mockUserData: UserResponseDTO = {
        id: 1,
        username: 'johndoe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      service.getAccountDetails().subscribe(response => {
        expect(response).toEqual(mockUserData);
        expect(response.id).toBe(1);
        expect(response.username).toBe('johndoe');
        expect(response.firstName).toBe('John');
        expect(response.lastName).toBe('Doe');
        expect(response.email).toBe('john.doe@example.com');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/account/details`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUserData);
    });

    it('should include authorization header', () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token');

      service.getAccountDetails().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/account/details`);

      expect(req.request.headers.has(HTTP_HEADERS.AUTHORISATION)).toBe(true);
      expect(req.request.headers.get(HTTP_HEADERS.AUTHORISATION)).toBe('Bearer test-token');

      req.flush({});
      localStorage.clear();
    });

    it('should handle 401 unauthorized error', () => {
      const mockError = { message: 'Unauthorized' };

      service.getAccountDetails().subscribe({
        next: () => fail('should have failed with 401 error'),
        error: error => {
          expect(error.status).toBe(401);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/account/details`);
      req.flush(mockError, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 404 not found error', () => {
      const mockError = { message: 'User not found' };

      service.getAccountDetails().subscribe({
        next: () => fail('should have failed with 404 error'),
        error: error => {
          expect(error.status).toBe(404);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/account/details`);
      req.flush(mockError, { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 server error', () => {
      const mockError = { message: 'Internal server error' };

      service.getAccountDetails().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: error => {
          expect(error.status).toBe(500);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/account/details`);
      req.flush(mockError, { status: 500, statusText: 'Internal Server Error' });
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', () => {
      service.deleteAccount().subscribe(response => {
        expect(response).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/account/delete`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should include authorization header', () => {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'test-token');

      service.deleteAccount().subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/account/delete`);

      expect(req.request.headers.has(HTTP_HEADERS.AUTHORISATION)).toBe(true);
      expect(req.request.headers.get(HTTP_HEADERS.AUTHORISATION)).toBe('Bearer test-token');

      req.flush(null, { status: 204, statusText: 'No Content' });
      localStorage.clear(); // Cleanup
    });

    it('should handle 401 unauthorized error', () => {
      const mockError = { message: 'Unauthorized' };

      service.deleteAccount().subscribe({
        next: () => fail('should have failed with 401 error'),
        error: error => {
          expect(error.status).toBe(401);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/account/delete`);
      req.flush(mockError, { status: 401, statusText: 'Unauthorized' });
    });

    it('should handle 403 forbidden error', () => {
      const mockError = { message: 'Access denied' };

      service.deleteAccount().subscribe({
        next: () => fail('should have failed with 403 error'),
        error: error => {
          expect(error.status).toBe(403);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/account/delete`);
      req.flush(mockError, { status: 403, statusText: 'Forbidden' });
    });

    it('should handle 500 server error', () => {
      const mockError = { message: 'Failed to delete account' };

      service.deleteAccount().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: error => {
          expect(error.status).toBe(500);
          expect(error.error).toEqual(mockError);
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/account/delete`);
      req.flush(mockError, { status: 500, statusText: 'Internal Server Error' });
    });
  });
});
