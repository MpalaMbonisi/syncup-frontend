import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ROUTES, STORAGE_KEYS } from '../constants/app.constants';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

  if (token && token !== 'null' && token.trim() !== '') {
    // User is authenticated
    return true;
  }

  // User is unauthenticated redirect to login
  router.navigate([ROUTES.LOGIN]);
  return false;
};
