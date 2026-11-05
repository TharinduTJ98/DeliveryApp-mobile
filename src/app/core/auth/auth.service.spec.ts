import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';

import { AuthTokenStorage } from './auth-token-storage.service';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let tokenStorage: AuthTokenStorage;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    authService = TestBed.inject(AuthService);
    tokenStorage = TestBed.inject(AuthTokenStorage);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    tokenStorage.clearToken();
  });

  it('sends registration fields to the register endpoint', () => {
    const request = {
      fullName: 'Taylor Example',
      email: 'taylor@example.com',
      mobile: '+911234567890',
      password: 'password123',
      role: 0,
    };

    authService.register(request).subscribe();

    const registration = http.expectOne(`${environment.apiBaseUrl}/Auth/register`);
    expect(registration.request.method).toBe('POST');
    expect(registration.request.body).toEqual(request);
    registration.flush({});
  });

  it('sends login credentials and stores the returned JWT', () => {
    authService.login({ email: 'taylor@example.com', password: 'password123' }, true).subscribe();

    const login = http.expectOne(`${environment.apiBaseUrl}/Auth/login`);
    expect(login.request.method).toBe('POST');
    expect(login.request.body).toEqual({ email: 'taylor@example.com', password: 'password123' });
    expect(login.request.headers.has('Authorization')).toBe(false);
    login.flush({ token: 'test-jwt' });

    expect(tokenStorage.getToken()).toBe('test-jwt');
    expect(localStorage.getItem('access_token')).toBe('test-jwt');
  });

  it('adds the stored JWT only to requests for the configured API', () => {
    tokenStorage.setToken('test-jwt', false);
    const client = TestBed.inject(HttpClient);

    client.get(`${environment.apiBaseUrl}/Orders`).subscribe();
    const apiRequest = http.expectOne(`${environment.apiBaseUrl}/Orders`);
    expect(apiRequest.request.headers.get('Authorization')).toBe('Bearer test-jwt');
    apiRequest.flush([]);

    client.get('https://example.com/data').subscribe();
    const externalRequest = http.expectOne('https://example.com/data');
    expect(externalRequest.request.headers.has('Authorization')).toBe(false);
    externalRequest.flush({});
  });
});
