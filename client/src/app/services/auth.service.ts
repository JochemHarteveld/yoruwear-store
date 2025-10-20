import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { 
  RegisterRequest, 
  LoginRequest, 
  AuthResponse, 
  User, 
  Tokens, 
  UserInfoResponse,
  MessageResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ApiError 
} from '../types/auth.types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/auth`;
  
  // Auth state management
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private tokensSubject = new BehaviorSubject<Tokens | null>(null);

  // Public observables
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public tokens$ = this.tokensSubject.asObservable();

  constructor() {
    // Check for existing tokens on service initialization
    this.loadTokensFromStorage();
  }

  /**
   * Register a new user
   */
  register(registerData: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, registerData)
      .pipe(
        tap(response => {
          this.handleAuthSuccess(response);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Login with email and password
   */
  login(loginData: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, loginData)
      .pipe(
        tap(response => {
          this.handleAuthSuccess(response);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const refreshData: RefreshTokenRequest = { refreshToken };
    
    return this.http.post<RefreshTokenResponse>(`${this.apiUrl}/refresh`, refreshData)
      .pipe(
        tap(response => {
          this.saveTokens(response.tokens);
          this.tokensSubject.next(response.tokens);
        }),
        catchError(this.handleError.bind(this))
      );
  }

  /**
   * Get current user info
   */
  getCurrentUser(): Observable<UserInfoResponse> {
    return this.http.get<UserInfoResponse>(`${this.apiUrl}/me`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(response => {
        this.currentUserSubject.next(response.user);
        this.isAuthenticatedSubject.next(true);
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Logout user
   */
  logout(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.apiUrl}/logout`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        this.handleLogout();
      }),
      catchError(error => {
        // Even if logout fails on server, clear local state
        this.handleLogout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value && !!this.getAccessToken();
  }

  /**
   * Get current user (synchronous)
   */
  getCurrentUserSync(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  /**
   * Get authorization headers for API requests
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getAccessToken();
    if (!token) {
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  /**
   * Initialize user state (call after app startup)
   */
  initializeAuth(): void {
    const token = this.getAccessToken();
    if (token) {
      // Verify token and get user info
      this.getCurrentUser().subscribe({
        next: () => {
          // User state already updated in getCurrentUser()
        },
        error: () => {
          // Token might be expired, try to refresh
          this.refreshToken().subscribe({
            next: () => {
              // Retry getting user info
              this.getCurrentUser().subscribe();
            },
            error: () => {
              // Refresh failed, clear everything
              this.handleLogout();
            }
          });
        }
      });
    }
  }

  // Private helper methods

  private handleAuthSuccess(response: AuthResponse): void {
    this.saveTokens(response.tokens);
    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
    this.tokensSubject.next(response.tokens);
  }

  private handleLogout(): void {
    this.clearTokens();
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.tokensSubject.next(null);
  }

  private saveTokens(tokens: Tokens): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  private clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  private loadTokensFromStorage(): void {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    
    if (accessToken && refreshToken) {
      const tokens: Tokens = { accessToken, refreshToken };
      this.tokensSubject.next(tokens);
    }
  }

  private handleError(error: any): Observable<never> {
    console.error('Auth service error:', error);
    
    if (error.status === 401) {
      // Unauthorized - clear auth state
      this.handleLogout();
    }
    
    // Return API error or generic message
    const errorMessage = error?.error?.error || error?.message || 'An unexpected error occurred';
    return throwError(() => new Error(errorMessage));
  }
}