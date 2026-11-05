import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs';
import type { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { AuthTokenStorage } from './auth-token-storage.service';

export interface RegisterRequest {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  role: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token?: string;
  accessToken?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenStorage = inject(AuthTokenStorage);
  private readonly authUrl = `${environment.apiBaseUrl}/Auth`;

  register(request: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.authUrl}/register`, request);
  }

  login(request: LoginRequest, rememberMe: boolean): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, request).pipe(
      tap((response) => {
        const token = response.token ?? response.accessToken;
        if (!token) {
          throw new Error('The login response did not contain a JWT token.');
        }
        this.tokenStorage.setToken(token, rememberMe);
      }),
    );
  }
}

export function getAuthErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return error instanceof Error ? error.message : fallback;
  }

  const payload: unknown = error.error;
  if (typeof payload === 'string' && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const details = payload as Record<string, unknown>;
    for (const key of ['message', 'title', 'detail']) {
      const message = details[key];
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }
  }

  return fallback;
}
