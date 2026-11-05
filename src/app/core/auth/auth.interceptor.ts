import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { environment } from '../../../environments/environment';

import { AuthTokenStorage } from './auth-token-storage.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const apiBaseUrl = environment.apiBaseUrl;
  const requestUrl = request.url.toLowerCase();

  const isApiRequest = request.url === apiBaseUrl || request.url.startsWith(`${apiBaseUrl}/`);
  if (!isApiRequest || /\/auth\/(login|register)(\?|$)/i.test(requestUrl)) {
    return next(request);
  }

  const token = inject(AuthTokenStorage).getToken();
  if (!token) {
    return next(request);
  }

  return next(
    request.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    }),
  );
};
