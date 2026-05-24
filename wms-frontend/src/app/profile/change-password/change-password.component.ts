import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button routerLink="/profile"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h1 class="page-title mb-0">Change Password</h1>
          <p class="page-subtitle mt-1">Update your account password</p>
        </div>
      </div>

      <div class="form-container">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-card">
          <div class="form-section">
            <h3 class="section-title">Password Details</h3>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Current Password</mat-label>
              <input matInput [type]="showCurrent ? 'text' : 'password'" formControlName="currentPassword">
              <button mat-icon-button matSuffix (click)="showCurrent = !showCurrent" type="button">
                <mat-icon>{{ showCurrent ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('currentPassword')?.hasError('required') && form.get('currentPassword')?.touched) {
                <mat-error>Current password is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>New Password</mat-label>
              <input matInput [type]="showNew ? 'text' : 'password'" formControlName="newPassword">
              <button mat-icon-button matSuffix (click)="showNew = !showNew" type="button">
                <mat-icon>{{ showNew ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('newPassword')?.hasError('required') && form.get('newPassword')?.touched) {
                <mat-error>New password is required</mat-error>
              }
              @if (form.get('newPassword')?.hasError('minlength') && form.get('newPassword')?.touched) {
                <mat-error>Minimum 6 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm New Password</mat-label>
              <input matInput [type]="showConfirm ? 'text' : 'password'" formControlName="confirmPassword">
              <button mat-icon-button matSuffix (click)="showConfirm = !showConfirm" type="button">
                <mat-icon>{{ showConfirm ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (form.get('confirmPassword')?.hasError('required') && form.get('confirmPassword')?.touched) {
                <mat-error>Please confirm your password</mat-error>
              }
              @if (form.hasError('mismatch') && form.get('confirmPassword')?.touched) {
                <mat-error>Passwords do not match</mat-error>
              }
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button mat-stroked-button type="button" routerLink="/profile">Cancel</button>
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || submitting">
              @if (submitting) {
                <mat-spinner diameter="20" style="display:inline-block;"></mat-spinner>
              }
              Change Password
            </button>
          </div>

          @if (successMsg) {
            <div class="msg-success">{{ successMsg }}</div>
          }
          @if (errorMsg) {
            <div class="msg-error">{{ errorMsg }}</div>
          }
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-container { max-width: 520px; }
    .form-card { display: flex; flex-direction: column; gap: 20px; }
    .form-section { background: white; padding: 24px 28px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .section-title { font-size: 15px; font-weight: 600; color: #1e293b; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
    .full-width { width: 100%; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; }
    .msg-success { padding: 12px 16px; border-radius: 8px; background: #dcfce7; color: #166534; font-size: 14px; font-weight: 500; }
    .msg-error { padding: 12px 16px; border-radius: 8px; background: #fef2f2; color: #991b1b; font-size: 14px; font-weight: 500; }
  `]
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private snackBar = inject(MatSnackBar);

  showCurrent = false;
  showNew = false;
  showConfirm = false;
  submitting = false;
  successMsg = '';
  errorMsg = '';

  form: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required],
  }, { validators: this.passwordMatchValidator });

  private passwordMatchValidator(g: AbstractControl): ValidationErrors | null {
    const newPw = g.get('newPassword')?.value;
    const confirmPw = g.get('confirmPassword')?.value;
    return newPw === confirmPw ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    this.successMsg = '';
    this.errorMsg = '';

    this.profileService.changePassword(this.form.value).subscribe({
      next: () => {
        this.successMsg = 'Password changed successfully!';
        this.snackBar.open('Password changed successfully', 'Close', { duration: 3000 });
        this.form.reset();
        this.submitting = false;
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = err.error?.message || 'Failed to change password. Please try again.';
      },
    });
  }
}
