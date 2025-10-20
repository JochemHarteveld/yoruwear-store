import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Skip auth header for authentication endpoints
  const isAuthEndpoint = req.url.includes('/api/auth/');
  const isLoginOrRegister = req.url.includes('/api/auth/login') || 
                           req.url.includes('/api/auth/register') ||
                           req.url.includes('/api/auth/refresh');
  
  // Add auth header if user is authenticated and not an auth endpoint
  let authReq = req;
  if (!isAuthEndpoint || (!isLoginOrRegister && isAuthEndpoint)) {
    const token = authService.getAccessToken();
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 errors (unauthorized)
      if (error.status === 401 && !isLoginOrRegister) {
        // Try to refresh token
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          return authService.refreshToken().pipe(
            switchMap(() => {
              // Retry the original request with new token
              const newToken = authService.getAccessToken();
              if (newToken) {
                const retryReq = req.clone({
                  headers: req.headers.set('Authorization', `Bearer ${newToken}`)
                });
                return next(retryReq);
              }
              return throwError(() => error);
            }),
            catchError((refreshError) => {
              // Refresh failed, clear auth state and return original error
              console.log('Token refresh failed, redirecting to login');
              return throwError(() => error);
            })
          );
        }
      }
      
      return throwError(() => error);
    })
  );
};