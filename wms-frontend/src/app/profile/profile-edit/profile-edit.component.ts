import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ProfileService } from '../services/profile.service';
import { Profile } from '../models/profile.model';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button routerLink="/profile"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h1 class="page-title mb-0">Edit Profile</h1>
          <p class="page-subtitle mt-1">Update your personal information</p>
        </div>
      </div>

      @if (loading) {
        <div style="display: flex; justify-content: center; padding: 80px;">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else if (profile) {
        <div class="form-container">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-grid">
            <div class="form-section">
              <h3 class="section-title">Personal Information</h3>
              <div class="grid-2">
                <mat-form-field appearance="outline">
                  <mat-label>First Name</mat-label>
                  <input matInput formControlName="firstName">
                  @if (form.get('firstName')?.hasError('required') && form.get('firstName')?.touched) {
                    <mat-error>Required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Last Name</mat-label>
                  <input matInput formControlName="lastName">
                  @if (form.get('lastName')?.hasError('required') && form.get('lastName')?.touched) {
                    <mat-error>Required</mat-error>
                  }
                </mat-form-field>
              </div>
              <div class="grid-2">
                <mat-form-field appearance="outline">
                  <mat-label>Gender</mat-label>
                  <mat-select formControlName="gender">
                    <mat-option value="M">Male</mat-option>
                    <mat-option value="F">Female</mat-option>
                    <mat-option value="O">Other</mat-option>
                  </mat-select>
                  @if (form.get('gender')?.hasError('required') && form.get('gender')?.touched) {
                    <mat-error>Required</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Date of Birth</mat-label>
                  <input matInput formControlName="dob" type="date">
                  @if (form.get('dob')?.hasError('required') && form.get('dob')?.touched) {
                    <mat-error>Required</mat-error>
                  }
                </mat-form-field>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">Contact Information</h3>
              <div class="grid-2">
                <mat-form-field appearance="outline">
                  <mat-label>Email</mat-label>
                  <input matInput formControlName="email" type="email">
                  @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
                    <mat-error>Required</mat-error>
                  }
                  @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
                    <mat-error>Invalid email</mat-error>
                  }
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Phone Number</mat-label>
                  <input matInput formControlName="phoneNumber" type="tel">
                  @if (form.get('phoneNumber')?.hasError('required') && form.get('phoneNumber')?.touched) {
                    <mat-error>Required</mat-error>
                  }
                  @if (form.get('phoneNumber')?.hasError('pattern') && form.get('phoneNumber')?.touched) {
                    <mat-error>Enter a valid 10-digit number</mat-error>
                  }
                </mat-form-field>
              </div>
            </div>

            @if (isAdmin) {
              <div class="form-section">
                <h3 class="section-title">Employment Details (Admin)</h3>
                <div class="grid-2">
                  <mat-form-field appearance="outline">
                    <mat-label>Department</mat-label>
                    <input matInput formControlName="departmentName">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Role</mat-label>
                    <input matInput formControlName="roleName">
                  </mat-form-field>
                </div>
                <div class="grid-2">
                  <mat-form-field appearance="outline">
                    <mat-label>Date of Joining</mat-label>
                    <input matInput formControlName="doj" type="date">
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Status</mat-label>
                    <mat-select formControlName="status">
                      <mat-option value="Active">Active</mat-option>
                      <mat-option value="Inactive">Inactive</mat-option>
                    </mat-select>
                  </mat-form-field>
                </div>
              </div>
            }

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/profile">Cancel</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || submitting">
                @if (submitting) {
                  <mat-spinner diameter="20" style="display:inline-block;"></mat-spinner>
                }
                Save Changes
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .form-container { max-width: 720px; }
    .form-grid { display: flex; flex-direction: column; gap: 20px; }
    .form-section { background: white; padding: 24px 28px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
    .section-title { font-size: 15px; font-weight: 600; color: #1e293b; margin: 0 0 16px; padding-bottom: 12px; border-bottom: 1px solid #f1f5f9; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; }
    @media (max-width: 600px) { .grid-2 { grid-template-columns: 1fr; } }
  `]
})
export class ProfileEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  form!: FormGroup;
  profile: Profile | null = null;
  loading = true;
  submitting = false;
  isAdmin = false;

  ngOnInit(): void {
    this.isAdmin = this.profileService.isAdmin();
    this.profileService.getProfile().subscribe({
      next: (p) => {
        this.profile = p;
        this.initForm(p);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  private initForm(p: Profile): void {
    this.form = this.fb.group({
      firstName: [{ value: p.firstName, disabled: !this.isAdmin }, Validators.required],
      lastName: [{ value: p.lastName, disabled: !this.isAdmin }, Validators.required],
      gender: [{ value: p.gender, disabled: !this.isAdmin }, Validators.required],
      dob: [{ value: p.dob, disabled: !this.isAdmin }, Validators.required],
      email: [p.email, [Validators.required, Validators.email]],
      phoneNumber: [p.phoneNumber, [Validators.required, Validators.pattern(/^\d{10}$/)]],
      departmentName: [{ value: p.departmentName, disabled: true }],
      roleName: [{ value: p.roleName, disabled: true }],
      doj: [{ value: p.doj, disabled: true }],
      status: [{ value: p.status, disabled: !this.isAdmin }],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting = true;
    const data = { ...this.form.getRawValue(), employeeId: this.profile!.employeeId };

    this.profileService.updateProfile(data).subscribe({
      next: () => {
        this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/profile']);
      },
      error: () => {
        this.submitting = false;
        this.snackBar.open('Failed to update profile', 'Close', { duration: 3000 });
      },
    });
  }
}
