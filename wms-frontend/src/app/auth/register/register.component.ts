import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DepartmentService } from '../../services/department.service';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest, Department } from '../../models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      <div class="w-full max-w-2xl bg-white rounded-xl shadow-md p-8">
        <h2 class="text-2xl font-bold text-surface-900 mb-4">Create your account</h2>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="input-label">First Name</label>
            <input formControlName="firstName" class="input-field" placeholder="First name">
            <p class="input-error" *ngIf="form.get('firstName')?.touched && form.get('firstName')?.hasError('required')">First name is required</p>
          </div>

          <div>
            <label class="input-label">Last Name</label>
            <input formControlName="lastName" class="input-field" placeholder="Last name">
            <p class="input-error" *ngIf="form.get('lastName')?.touched && form.get('lastName')?.hasError('required')">Last name is required</p>
          </div>

          <div class="md:col-span-2">
            <label class="input-label">Email</label>
            <input formControlName="email" class="input-field" placeholder="you@company.com">
            <p class="input-error" *ngIf="form.get('email')?.touched && form.get('email')?.hasError('email')">Enter a valid email</p>
            <p class="input-error" *ngIf="form.get('email')?.touched && form.get('email')?.hasError('required')">Email is required</p>
          </div>

          <div>
            <label class="input-label">Phone Number</label>
            <input formControlName="phoneNumber" class="input-field" placeholder="10 digit phone">
            <p class="input-error" *ngIf="form.get('phoneNumber')?.touched && form.get('phoneNumber')?.hasError('pattern')">Phone must be 10 digits</p>
          </div>

          <div>
            <label class="input-label">Gender</label>
            <select formControlName="gender" class="input-field">
              <option value="">Select</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
            <p class="input-error" *ngIf="form.get('gender')?.touched && form.get('gender')?.hasError('required')">Gender is required</p>
          </div>

          <div>
            <label class="input-label">DOB</label>
            <input type="date" formControlName="dob" class="input-field">
            <p class="input-error" *ngIf="form.get('dob')?.touched && form.get('dob')?.hasError('required')">DOB is required</p>
          </div>

          <div>
            <label class="input-label">DOJ</label>
            <input type="date" formControlName="doj" class="input-field">
            <p class="input-error" *ngIf="form.get('doj')?.touched && form.get('doj')?.hasError('required')">DOJ is required</p>
          </div>

          <div>
            <label class="input-label">Username</label>
            <input formControlName="username" class="input-field" placeholder="Choose a username">
            <p class="input-error" *ngIf="form.get('username')?.touched && form.get('username')?.hasError('required')">Username is required</p>
          </div>

          <div>
            <label class="input-label">Password</label>
            <input type="password" formControlName="password" class="input-field" placeholder="Create a password">
            <p class="input-error" *ngIf="form.get('password')?.touched && form.get('password')?.hasError('required')">Password is required</p>
            <p class="input-error" *ngIf="form.get('password')?.touched && form.get('password')?.hasError('minlength')">Password must be at least 6 characters</p>
          </div>

          <div class="md:col-span-2">
            <label class="input-label">Department</label>
            <select formControlName="departmentId" class="input-field">
              <option value="">Select department</option>
              <option *ngFor="let d of departments" [value]="d.departmentId">{{ d.departmentName }}</option>
            </select>
            <p class="input-error" *ngIf="form.get('departmentId')?.touched && form.get('departmentId')?.hasError('required')">Department is required</p>
          </div>

          <div class="md:col-span-2 mt-4">
            <div *ngIf="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-3">{{ error }}</div>
            <div *ngIf="success" class="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded mb-3">{{ success }}</div>

            <div class="flex gap-3">
              <button type="submit" class="btn-primary" [disabled]="loading">{{ loading ? 'Registering...' : 'Register' }}</button>
              <button type="button" class="btn-ghost" (click)="router.navigate(['/auth/login'])">Back to Login</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  form = inject(FormBuilder).nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    gender: ['', Validators.required],
    dob: ['', Validators.required],
    doj: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    departmentId: [null, Validators.required]
  });

  private deptService = inject(DepartmentService);
  private authService = inject(AuthService);
  public router = inject(Router);

  departments: any[] = [];
  loading = false;
  error = '';
  success = '';

  constructor() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.deptService.getAll().subscribe({
      next: (data: Department[]) => this.departments = data,
      error: () => {
        this.departments = [];
        this.error = 'Unable to load departments. Please try again.';
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';
    const payload: RegisterRequest = {
      ...this.form.getRawValue() as any,
      roleId: 3 // ensure Employee role
    };

    this.authService.register(payload).subscribe({
      next: (res: any) => {
        this.success = 'Registration successful. Redirecting to login...';
        setTimeout(() => this.router.navigate(['/auth/login']), 1400);
      },
      error: (err: any) => {
        this.error = err?.error?.message || err?.message || 'Registration failed';
        this.loading = false;
      }
    });
  }
}
