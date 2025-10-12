import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth-service';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register', () => {
    it('should register a user successfully', () => {
      const mockUser = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'johndoe@yahoo.com',
        password: 'StrongPassword1234',
      };

      const mockResponse = { message: 'User registered successfully!' };

      const req = httpMock.expectOne('http://3.71.52.212/auth/register');
      service.register(mockUser).subscribe(() => {
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockUser);
        req.flush(mockResponse);
      });

      it('should handle registration error', () => {
        const mockUser = {
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'johndoe@yahoo.com',
          password: 'StrongPassword1234',
        };

        const mockError = { message: 'Username already exists' };

        service.register(mockUser).subscribe({
          next: () => fail('should have failed with 409 error'),
          error: error => {
            expect(error.status).toBe(409);
            expect(error.error).toEqual(mockError);
          },
        });

        const req = httpMock.expectOne('http://3.71.52.212/auth/register');
        req.flush(mockError, { status: 409, statusText: 'Conflict' });
      });
    });

    describe('login', () => {
      it('should login a user successfully', () => {
        const mockCredentials = {
          username: 'johndoe',
          password: 'StrongPassword1234',
        };

        const mockResponse = { token: 'mock-jwt-token-12345' };

        service.login(mockCredentials).subscribe(response => {
          expect(response).toEqual(mockResponse);
          expect(response.token).toBe('mock-jwt-token-12345');
        });

        const req = httpMock.expectOne('http://3.71.52.212/auth/login');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(mockCredentials);
        req.flush(mockResponse);
      });

      it('should handle login error with invalid credentials', () => {
        const mockCredentials = {
          username: 'johndoe',
          password: 'wrongPassword',
        };

        const mockError = { message: 'Invalid credentials' };

        service.login(mockCredentials).subscribe({
          next: () => fail('should have failed with 401 error'),
          error: error => {
            expect(error.status).toBe(401);
            expect(error.error).toEqual(mockError);
          },
        });

        const req = httpMock.expectOne('http://3.71.52.212/auth/login');
        req.flush(mockError, { status: 401, statusText: 'Unauthorized' });
      });
    });
  });
});
