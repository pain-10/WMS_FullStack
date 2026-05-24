import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LeaveService } from '../../services/leave.service';
import { Leave } from '../../models';

@Component({
  selector: 'app-my-leave',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h1 class="page-title">My Leave</h1>
          <p class="page-subtitle">View your leave history and submit a new request.</p>
        </div>
        <div class="flex gap-3">
          <button class="btn-secondary" type="button" (click)="showApplyForm = !showApplyForm">
            {{ showApplyForm ? 'Close Form' : 'Apply Leave' }}
          </button>
          <a routerLink="/dashboard" class="btn-secondary">Back to Dashboard</a>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="stat-card">
          <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-surface-500">Pending</p>
            <p class="text-2xl font-bold text-surface-900">{{ pendingCount }}</p>
            <p class="text-xs text-surface-400 mt-1">Requests waiting for approval</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-surface-500">Approved</p>
            <p class="text-2xl font-bold text-surface-900">{{ approvedCount }}</p>
            <p class="text-xs text-surface-400 mt-1">Past approved requests</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-surface-500">Remaining</p>
            <p class="text-2xl font-bold text-surface-900">{{ remainingLeaves }}</p>
            <p class="text-xs text-surface-400 mt-1">Estimated leave balance</p>
          </div>
        </div>
      </div>

      @if (showApplyForm) {
        <div class="card p-6">
          <h2 class="text-lg font-semibold text-surface-900 mb-4">Apply for leave</h2>
          <form [formGroup]="leaveForm" (ngSubmit)="applyLeave()" class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="input-label">Leave Type</label>
              <select formControlName="leaveType" class="input-field">
                <option value="Sick">Sick Leave</option>
                <option value="Casual">Casual Leave</option>
                <option value="Earned">Earned Leave</option>
              </select>
            </div>
            <div>
              <label class="input-label">From Date</label>
              <input type="date" formControlName="fromDate" class="input-field" [min]="todayStr">
            </div>
            <div>
              <label class="input-label">To Date</label>
              <input type="date" formControlName="toDate" class="input-field" [min]="todayStr">
            </div>
            <div>
              <label class="input-label">Reason</label>
              <input type="text" formControlName="reason" class="input-field" placeholder="Reason for leave">
            </div>
            <div class="md:col-span-2 flex justify-end gap-3 pt-2">
              <button type="button" class="btn-secondary" (click)="showApplyForm = false">Cancel</button>
              <button type="submit" class="btn-primary" [disabled]="leaveForm.invalid">Submit Request</button>
            </div>
          </form>
        </div>
      }

      <div class="card p-6">
        <h2 class="text-lg font-semibold text-surface-900 mb-4">Leave history</h2>
        <div class="space-y-3">
          @for (leave of leaves; track leave.leaveId) {
            <div class="rounded-2xl border border-surface-100 bg-surface-50 p-4">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="font-medium text-surface-900">{{ leave.leaveType }} leave</p>
                  <p class="text-sm text-surface-500">{{ leave.fromDate | date:'mediumDate' }} - {{ leave.toDate | date:'mediumDate' }}</p>
                  <p class="mt-1 text-sm text-surface-600">{{ leave.reason || 'No reason provided' }}</p>
                </div>
                <span [class]="getStatusBadge(leave.status)">{{ leave.status }}</span>
              </div>
            </div>
          }
          @if (leaves.length === 0) {
            <div class="rounded-2xl border border-dashed border-surface-200 p-8 text-center text-sm text-surface-500">No leave requests found.</div>
          }
        </div>
      </div>
    </div>
  `
})
export class MyLeaveComponent implements OnInit {
  leaves: Leave[] = [];
  showApplyForm = false;
  remainingLeaves = 0;
  pendingCount = 0;
  approvedCount = 0;
  todayStr = new Date().toISOString().split('T')[0];

  private fb = inject(FormBuilder);
  private leaveService = inject(LeaveService);
  private authService = inject(AuthService);

  leaveForm = this.fb.group({
    leaveType: ['Sick', Validators.required],
    fromDate: ['', Validators.required],
    toDate: ['', Validators.required],
    reason: ['', Validators.required],
  });

  ngOnInit(): void {
    this.loadLeaves();
  }

  loadLeaves(): void {
    const employeeId = this.authService.currentUserValue?.userId || 0;
    this.leaveService.getByEmployee(employeeId).subscribe((leaves: Leave[]) => {
      this.leaves = leaves.sort((a, b) => b.appliedOn.localeCompare(a.appliedOn));
      this.pendingCount = leaves.filter(leave => leave.status === 'Pending').length;
      this.approvedCount = leaves.filter(leave => leave.status === 'Approved').length;
      this.remainingLeaves = Math.max(12 - this.approvedCount, 0);
    });
  }

  applyLeave(): void {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      return;
    }

    const employeeId = this.authService.currentUserValue?.userId || 0;
    this.leaveService.apply({
      empId: employeeId,
      leaveType: this.leaveForm.value.leaveType as Leave['leaveType'],
      fromDate: this.leaveForm.value.fromDate || '',
      toDate: this.leaveForm.value.toDate || '',
      reason: this.leaveForm.value.reason || '',
    }).subscribe(() => {
      this.leaveForm.reset({ leaveType: 'Sick' });
      this.showApplyForm = false;
      this.loadLeaves();
    });
  }

  getStatusBadge(status: string): string {
    switch (status) {
      case 'Approved': return 'badge-success';
      case 'Pending': return 'badge-warning';
      case 'Rejected': return 'badge-danger';
      case 'Cancelled': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  }
}
