import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';

import { authGuard } from './auth-guard';
import { ROUTES, STORAGE_KEYS } from '../constants/app.constants';

describe('authGuard', () => {
  let router: jasmine.SpyObj<Router>;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access when token exists', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, 'mock-jwt-token-12345');

    const result = TestBed.runInInjectionContext(() => {
      return authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should deny access and redirect to login when token does not exist', () => {
    const result = TestBed.runInInjectionContext(() => {
      return authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
  });

  it('should deny access when token is null', () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);

    const result = TestBed.runInInjectionContext(() => {
      return authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
  });

  it('should deny acces when token is empty string', () => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, '');

    const result = TestBed.runInInjectionContext(() => {
      return authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    });

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith([ROUTES.LOGIN]);
  });
});
