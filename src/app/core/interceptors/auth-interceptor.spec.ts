import { TestBed } from '@angular/core/testing';
import { HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';

import { authInterceptor } from './auth-interceptor';
import { of } from 'rxjs';
import { API_ENDPOINTS, HTTP_HEADERS, STORAGE_KEYS } from '../constants/app.constants';
import { environment } from '../../../environments/environment';

describe('authInterceptor', () => {
  const mockNext: HttpHandlerFn = jasmine.createSpy('mockNext').and.returnValue(of(null));

  const interceptor: HttpInterceptorFn = (req, next) =>
    TestBed.runInInjectionContext(() => authInterceptor(req, next));

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should add Authorisation header when token exists and not auth endpoint', () => {
    const token = 'mock-jwt-token-12345';
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

    const req = new HttpRequest('GET', `${environment.apiUrl}${API_ENDPOINTS.LISTS.ALL}`);

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, mockNext);
    });

    expect(mockNext).toHaveBeenCalled();
    const interceptedRequest = (mockNext as jasmine.Spy).calls.mostRecent().args[0];
    expect(interceptedRequest.headers.get(HTTP_HEADERS.AUTHORISATION)).toBe(`Bearer ${token}`);
  });

  it('should not add Authorisation header for login endpoint', () => {
    const token = 'mock-jwt-token-12345';
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

    const req = new HttpRequest('POST', `${environment.apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`, {});

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, mockNext);
    });

    expect(mockNext).toHaveBeenCalled();
    const interceptedRequest = (mockNext as jasmine.Spy).calls.mostRecent().args[0];
    expect(interceptedRequest.headers.has(HTTP_HEADERS.AUTHORISATION)).toBeFalse();
  });

  it('should not add Authorisation header for register endpoint', () => {
    const token = 'mock-jwt-token-12345';
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

    const req = new HttpRequest('POST', `${environment.apiUrl}${API_ENDPOINTS.AUTH.REGISTER}`, {});

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, mockNext);
    });

    expect(mockNext).toHaveBeenCalled();
    const interceptedRequest = (mockNext as jasmine.Spy).calls.mostRecent().args[0];
    expect(interceptedRequest.headers.has(HTTP_HEADERS.AUTHORISATION)).toBeFalse();
  });

  it('should not add Authorisation header when token does not exist', () => {
    const req = new HttpRequest('GET', `${environment.apiUrl}${API_ENDPOINTS.LISTS.ALL}`);

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, mockNext);
    });

    expect(mockNext).toHaveBeenCalled();
    const interceptedRequest = (mockNext as jasmine.Spy).calls.mostRecent().args[0];
    expect(interceptedRequest.headers.has(HTTP_HEADERS.AUTHORISATION)).toBeFalse();
  });

  it('should handle empty token gracefully', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, '');

    const req = new HttpRequest('GET', `${environment.apiUrl}${API_ENDPOINTS.LISTS.ALL}`);

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, mockNext);
    });

    expect(mockNext).toHaveBeenCalled();
    const interceptedRequest = (mockNext as jasmine.Spy).calls.mostRecent().args[0];
    expect(interceptedRequest.headers.has(HTTP_HEADERS.AUTHORISATION)).toBeFalse();
  });

  it('should add Bearer prefix to token', () => {
    const token = 'my-mock-jwt-token-12345';
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

    const req = new HttpRequest('GET', `${environment.apiUrl}${API_ENDPOINTS.LISTS.ALL}`);

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, mockNext);
    });

    const interceptedRequest = (mockNext as jasmine.Spy).calls.mostRecent().args[0];
    expect(interceptedRequest.headers.get(HTTP_HEADERS.AUTHORISATION)).toBe(
      'Bearer my-mock-jwt-token-12345'
    );
  });

  it('should not modify original request when adding headers', () => {
    const token = 'mock-jwt-token-12345';
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);

    const req = new HttpRequest('GET', `${environment.apiUrl}${API_ENDPOINTS.LISTS.ALL}`);
    const originalHeaders = req.headers;

    TestBed.runInInjectionContext(() => {
      authInterceptor(req, mockNext);
    });

    // Original request should remain unchanged
    expect(req.headers).toBe(originalHeaders);
    expect(req.headers.has(HTTP_HEADERS.AUTHORISATION)).toBeFalse();

    // Cloned request should have the header
    const interceptedRequest = (mockNext as jasmine.Spy).calls.mostRecent().args[0];
    expect(interceptedRequest.headers.has(HTTP_HEADERS.AUTHORISATION)).toBeTrue();
  });
});
