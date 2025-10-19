import { HttpInterceptorFn } from '@angular/common/http';
import { HTTP_HEADERS, STORAGE_KEYS } from '../constants/app.constants';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

  // Skip adding token for auth endpoints (login/register)
  if (req.url.includes('/auth/')) {
    return next(req);
  }

  // If token exists, clone request and add Authorisation Header
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        [HTTP_HEADERS.AUTHORISATION]: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  // No token, proceed with original request
  return next(req);
};
