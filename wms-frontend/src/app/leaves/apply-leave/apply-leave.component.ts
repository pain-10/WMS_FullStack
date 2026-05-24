import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeaveService } from '../services/leave.service';
import { AuthService } from '../../services/auth.service';
import { LEAVE_TYPES } from '../models/leave.model';

@Component({
  selector: 'app-apply-leave',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="page-header flex items-center justify-between">
        <div>
          <h1 class="page-title">Apply for Leave</h1>
          <p class="page-subtitle">Submit a new leave request</p>
        </div>
        <a routerLink="/leave" mat-stroked-button>
          <mat-icon>arrow_back</mat-icon>
          Back to Leaves
        </a>
      </div>

      <mat-card class="max-w-2xl mx-auto">
        <mat-card-content class="p-6">
          <form [formGroup]="leaveForm" (ngSubmit)="onSubmit()">
            <div class="space-y-4">
              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Leave Type</mat-label>
                <mat-select formControlName="leaveType">
                  @for (t of leaveTypes; track t) {
                    <mat-option [value]="t">{{ t }} Leave</mat-option>
                  }
                </mat-select>
                @if (leaveForm.get('leaveType')?.hasError('required') && leaveForm.get('leaveType')?.touched) {
                  <mat-error>Leave type is required</mat-error>
                }
              </mat-form-field>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <mat-form-field appearance="outline">
                  <mat-label>From Date</mat-label>
                  <input matInput [matDatepicker]="fromPicker" formControlName="fromDate" [min]="today">
                  <mat-datepicker-toggle matSuffix [for]="fromPicker"></mat-datepicker-toggle>
                  <mat-datepicker #fromPicker></mat-datepicker>
                  @if (leaveForm.get('fromDate')?.hasError('required') && leaveForm.get('fromDate')?.touched) {
                    <mat-error>From date is required</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>To Date</mat-label>
                  <input matInput [matDatepicker]="toPicker" formControlName="toDate" [min]="leaveForm.get('fromDate')?.value || today">
                  <mat-datepicker-toggle matSuffix [for]="toPicker"></mat-datepicker-toggle>
                  <mat-datepicker #toPicker></mat-datepicker>
                  @if (leaveForm.get('toDate')?.hasError('required') && leaveForm.get('toDate')?.touched) {
                    <mat-error>To date is required</mat-error>
                  }
                  @if (leaveForm.hasError('dateRange')) {
                    <mat-error>To date must be on or after from date</mat-error>
                  }
                </mat-form-field>
              </div>

              <mat-form-field appearance="outline" class="w-full">
                <mat-label>Reason</mat-label>
                <textarea matInput formControlName="reason" rows="4" placeholder="Enter reason for leave..."></textarea>
                @if (leaveForm.get('reason')?.hasError('required') && leaveForm.get('reason')?.touched) {
                  <mat-error>Reason is required</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="flex justify-end gap-3 mt-6 pt-6 border-t border-surface-200">
              <a routerLink="/leave" mat-button>Cancel</a>
              <button mat-raised-button color="primary" type="submit" [disabled]="leaveForm.invalid || submitting">
                @if (submitting) {
                  <mat-spinner diameter="20" style="display: inline-block; margin-right: 8px;"></mat-spinner>
                }
                Submit Leave Request
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: []
})
export class ApplyLeaveComponent implements OnInit {
  leaveForm: FormGroup;
  leaveTypes = LEAVE_TYPES;
  submitting = false;
  today: Date;

  private fb = inject(FormBuilder);
  private leaveService = inject(LeaveService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  constructor() {
    this.today = new Date();
    this.leaveForm = this.fb.group({
      leaveType: ['Sick', Validators.required],
      fromDate: [null, Validators.required],
      toDate: [null, Validators.required],
      reason: ['', Validators.required],
    }, { validators: this.dateRangeValidator });
  }

  ngOnInit(): void {
    this.leaveForm.get('fromDate')?.valueChanges.subscribe(() => {
      this.leaveForm.get('toDate')?.updateValueAndValidity();
    });
  }

  private dateRangeValidator(group: FormGroup): { [key: string]: boolean } | null {
    const from = group.get('fromDate')?.value;
    const to = group.get('toDate')?.value;
    if (from && to) {
      return new Date(to) >= new Date(from) ? null : { dateRange: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.leaveForm.invalid) return;

    this.submitting = true;
    const employeeId = this.authService.currentUserValue?.userId || 0;
    const formVal = this.leaveForm.value;

    const formatDate = (d: Date) => {
      return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().split('T')[0];
    };

    this.leaveService.apply({
      empId: employeeId,
      leaveType: formVal.leaveType,
      fromDate: formatDate(new Date(formVal.fromDate)),
      toDate: formatDate(new Date(formVal.toDate)),
      reason: formVal.reason,
    }).subscribe({
      next: () => {
        this.snackBar.open('Leave request submitted successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/leave']);
      },
      error: (err) => {
        this.submitting = false;
        const msg = err.error?.message || 'Failed to submit leave request';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      }
    });
  }
}
