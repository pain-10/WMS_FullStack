import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-50 via-white to-primary-50 p-4">
      <div class="w-full max-w-md animate-fade-in">
        <div class="bg-white rounded-2xl shadow-lg shadow-primary-100/40 border border-surface-100 p-8">
          <!-- Logo -->
          <div class="text-center mb-6">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mx-auto mb-4 shadow-md shadow-primary-200/50">
              <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-surface-900">Welcome back</h1>
            <p class="text-surface-500 mt-1 text-sm">Sign in to access your workforce dashboard</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="input-label" for="login-username">Username</label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                <input type="text" formControlName="username" class="input-field pl-10 rounded-xl" placeholder="Enter your username" id="login-username">
              </div>
              <p class="input-error" *ngIf="loginForm.get('username')?.touched && loginForm.get('username')?.hasError('required')">
                Username is required
              </p>
            </div>

            <div>
              <label class="input-label" for="login-password">Password</label>
              <div class="relative">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <input [type]="showPassword ? 'text' : 'password'" formControlName="password" class="input-field pl-10 pr-10 rounded-xl" placeholder="Enter your password" id="login-password">
                <button type="button" (click)="showPassword = !showPassword" class="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  <svg *ngIf="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg *ngIf="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                </button>
              </div>
              <p class="input-error" *ngIf="loginForm.get('password')?.touched && loginForm.get('password')?.hasError('required')">
                Password is required
              </p>
            </div>

            <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {{ errorMessage }}
            </div>

            <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold hover:from-primary-700 hover:to-primary-800 focus:ring-4 focus:ring-primary-200 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center" [disabled]="loading" id="login-submit">
              <svg *ngIf="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              {{ loading ? 'Signing in...' : 'Sign In' }}
            </button>
            <div class="text-center">
              <a class="text-primary-600 hover:text-primary-700 text-sm font-medium cursor-pointer hover:underline" (click)="router.navigate(['/register'])">Register Here</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  loading = false;
  errorMessage = '';

    private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  public router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (this.authService.isLoggedIn) {
      const token = this.authService.getToken();
      if (token && !this.authService.isTokenExpired(token)) {
        this.redirectToDashboard();
      } else {
        this.authService.logout();
      }
    }
  }

  private redirectToDashboard(): void {
    const role = this.authService.userRole;
    if (role === 'Employee') {
      this.router.navigate(['/my-attendance']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        if (returnUrl && !returnUrl.startsWith('/auth/')) {
          this.router.navigateByUrl(returnUrl);
        } else {
          this.redirectToDashboard();
        }
      },
        error: (err: any) => {
          this.errorMessage = err.error?.message || err.message || 'Login failed. Please try again.';
          this.loading = false;
        }
    });
  }
}
