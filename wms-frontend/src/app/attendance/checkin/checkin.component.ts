import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { AttendanceService } from '../services/attendance.service';
import { Attendance, WORK_MODES } from '../models/attendance.model';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="page-header">
        <h1 class="page-title">Attendance Check-in</h1>
        <p class="page-subtitle">Mark your daily attendance</p>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <mat-card class="p-8">
          <mat-card-content>
            <div class="text-center">
              <div class="text-6xl font-bold text-surface-900 mb-2">{{ currentTime }}</div>
              <div class="text-xl text-surface-500 mb-8">{{ currentDate }}</div>

              <div class="mb-6">
                <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
                  [class.bg-accent-100]="status === 'Checked In'"
                  [class.text-accent-700]="status === 'Checked In'"
                  [class.bg-amber-100]="status === 'Checked Out'"
                  [class.text-amber-700]="status === 'Checked Out'"
                  [class.bg-surface-100]="status === 'Not Checked In'"
                  [class.text-surface-600]="status === 'Not Checked In'">
                  <mat-icon>circle</mat-icon>
                  <span>{{ status }}</span>
                </div>
              </div>

              @if (!isCheckedIn) {
                <mat-form-field appearance="outline" class="w-full max-w-xs">
                  <mat-label>Work Mode</mat-label>
                  <mat-select [(ngModel)]="selectedWorkMode">
                    @for (mode of workModes; track mode) {
                      <mat-option [value]="mode">{{ modeLabel(mode) }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>
              }

              <div class="flex gap-4 justify-center mt-6">
                @if (!isCheckedIn) {
                  <button mat-raised-button color="primary" size="large"
                    (click)="handleCheckIn()"
                    [disabled]="checkingIn"
                    class="!px-8 !py-6 !text-lg">
                    <mat-icon>login</mat-icon>
                    Check In
                  </button>
                }
                @if (isCheckedIn && !isCheckedOut) {
                  <button mat-raised-button color="accent" size="large"
                    (click)="handleCheckOut()"
                    [disabled]="checkingOut"
                    class="!px-8 !py-6 !text-lg">
                    <mat-icon>logout</mat-icon>
                    Check Out
                  </button>
                }
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="p-8">
          <mat-card-content>
            <h3 class="text-lg font-semibold text-surface-900 mb-6">Today's Summary</h3>
            <div class="space-y-6">
              <div class="flex items-center justify-between p-4 rounded-xl bg-surface-50">
                <span class="text-surface-600">Check In Time</span>
                <span class="font-semibold text-surface-900">{{ checkInTime }}</span>
              </div>
              <div class="flex items-center justify-between p-4 rounded-xl bg-surface-50">
                <span class="text-surface-600">Check Out Time</span>
                <span class="font-semibold text-surface-900">{{ checkOutTime }}</span>
              </div>
              <div class="flex items-center justify-between p-4 rounded-xl bg-surface-50">
                <span class="text-surface-600">Total Hours</span>
                <span class="font-semibold text-surface-900">{{ totalHoursLabel }}</span>
              </div>
              <div class="flex items-center justify-between p-4 rounded-xl bg-surface-50">
                <span class="text-surface-600">Work Mode</span>
                <span class="font-semibold text-surface-900">{{ todayRecord?.workMode || '--' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: []
})
export class CheckinComponent implements OnInit, OnDestroy {
  currentTime = '';
  currentDate = '';
  status = 'Not Checked In';
  selectedWorkMode = 'WFO';
  workModes = WORK_MODES;
  isCheckedIn = false;
  isCheckedOut = false;
  checkingIn = false;
  checkingOut = false;
  todayRecord: Attendance | null = null;

  private timeInterval: any;
  private authService = inject(AuthService);
  private attendanceService = inject(AttendanceService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.updateDateTime();
    this.timeInterval = setInterval(() => this.updateDateTime(), 1000);
    this.loadTodayRecord();
  }

  ngOnDestroy(): void {
    if (this.timeInterval) clearInterval(this.timeInterval);
  }

  private updateDateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    this.currentDate = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  private loadTodayRecord(): void {
    const employeeId = this.authService.currentUserValue?.userId || 0;
    if (!employeeId) return;

    this.attendanceService.getByEmployee(employeeId).subscribe(records => {
      const today = new Date().toISOString().split('T')[0];
      this.todayRecord = records.find(r => r.attendanceDate === today) || null;

      if (this.todayRecord) {
        this.isCheckedIn = true;
        this.isCheckedOut = !!this.todayRecord.checkOut;
        this.status = this.isCheckedOut ? 'Checked Out' : 'Checked In';
        this.selectedWorkMode = this.todayRecord.workMode;
      } else {
        this.isCheckedIn = false;
        this.isCheckedOut = false;
        this.status = 'Not Checked In';
      }
    });
  }

  handleCheckIn(): void {
    const employeeId = this.authService.currentUserValue?.userId || 0;
    if (!employeeId) return;

    this.checkingIn = true;
    this.attendanceService.checkIn(employeeId, this.selectedWorkMode).subscribe({
      next: () => {
        this.snackBar.open('Check-in successful!', 'Close', { duration: 3000 });
        this.loadTodayRecord();
        this.checkingIn = false;
      },
      error: () => {
        this.snackBar.open('Check-in failed. Please try again.', 'Close', { duration: 3000 });
        this.checkingIn = false;
      }
    });
  }

  handleCheckOut(): void {
    const employeeId = this.authService.currentUserValue?.userId || 0;
    if (!employeeId) return;

    this.checkingOut = true;
    this.attendanceService.checkOut(employeeId).subscribe({
      next: () => {
        this.snackBar.open('Check-out successful!', 'Close', { duration: 3000 });
        this.loadTodayRecord();
        this.checkingOut = false;
      },
      error: () => {
        this.snackBar.open('Check-out failed. Please try again.', 'Close', { duration: 3000 });
        this.checkingOut = false;
      }
    });
  }

  get checkInTime(): string {
    return this.todayRecord?.checkIn
      ? new Date(this.todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '--:--';
  }

  get checkOutTime(): string {
    return this.todayRecord?.checkOut
      ? new Date(this.todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '--:--';
  }

  get totalHoursLabel(): string {
    return this.todayRecord?.totalHours != null ? this.todayRecord.totalHours.toFixed(1) + 'h' : '0h';
  }

  modeLabel(mode: string): string {
    switch (mode) {
      case 'WFO': return 'Work From Office';
      case 'WFH': return 'Work From Home';
      case 'Hybrid': return 'Hybrid';
      default: return mode;
    }
  }
}
