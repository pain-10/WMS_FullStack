import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { UserLogin, LoginRequest, RegisterRequest, AuthResponse } from '../models';
import { API_BASE_URL } from '../config/api.config';

interface AuthResponseDto {
  employeeId: number;
  username: string;
  role: string;
  token: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserLogin | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenKey = 'wms_token';
  private userKey = 'wms_user';
  private http = inject(HttpClient);

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem(this.userKey);
    const token = localStorage.getItem(this.tokenKey);
    if (userData && token) {
      if (this.isTokenExpired(token)) {
        this.logout();
        return;
      }
      this.currentUserSubject.next(JSON.parse(userData));
    }
  }

  get currentUserValue(): UserLogin | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  get userRole(): string {
    return this.currentUserSubject.value?.roleName || '';
  }

  login(request: LoginRequest): Observable<UserLogin> {
    return this.http
      .post<AuthResponseDto>(`${API_BASE_URL}/api/auth/login`, request)
      .pipe(
        map(response => this.mapAuthResponse(response)),
        tap(user => {
          localStorage.setItem(this.tokenKey, user.token!);
          localStorage.setItem(this.userKey, JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    // Ensure the backend creates an Employee role by default
    const payload = { ...request, roleId: 3 };
    return this.http.post<AuthResponse>(`${API_BASE_URL}/api/auth/register`, payload);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private mapAuthResponse(response: AuthResponseDto): UserLogin {
    const roleName = response.role || 'Employee';

    return {
      userId: response.employeeId,
      username: response.username,
      roleId: this.getRoleId(roleName),
      roleName,
      token: response.token,
      lastLogin: response.expiresAt,
    };
  }

  private getRoleId(roleName: string): number {
    switch (roleName) {
      case 'Admin':
        return 1;
      case 'Manager':
        return 2;
      default:
        return 3;
    }
  }
}
