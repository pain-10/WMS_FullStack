import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Attendance } from '../../models';
import { AuthService } from '../../services/auth.service';
import { AttendanceService } from '../../services/attendance.service';

@Component({
  selector: 'app-my-attendance',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h1 class="page-title">My Attendance</h1>
          <p class="page-subtitle">Your personal check-in and check-out history.</p>
        </div>
        <a routerLink="/dashboard" class="btn-secondary">Back to Dashboard</a>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <div class="stat-card">
          <div class="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-surface-500">Today</p>
            <p class="text-2xl font-bold text-surface-900">{{ todayStatus }}</p>
            <p class="text-xs text-surface-400 mt-1">{{ todayTimeLabel }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-surface-500">Total records</p>
            <p class="text-2xl font-bold text-surface-900">{{ records.length }}</p>
            <p class="text-xs text-surface-400 mt-1">All saved entries</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8m-8 4h8m-8 4h5"/>
            </svg>
          </div>
          <div>
            <p class="text-sm text-surface-500">This week</p>
            <p class="text-2xl font-bold text-surface-900">{{ weekCount }}</p>
            <p class="text-xs text-surface-400 mt-1">Recent attendance entries</p>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <h2 class="text-lg font-semibold text-surface-900 mb-4">Attendance history</h2>
        <div class="overflow-hidden rounded-2xl border border-surface-100">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              @for (record of records; track record.attendanceId) {
                <tr>
                  <td class="text-surface-600 text-sm">{{ record.attendanceDate | date:'mediumDate' }}</td>
                  <td class="text-surface-600 text-sm">{{ record.checkIn | date:'shortTime' }}</td>
                  <td class="text-surface-600 text-sm">{{ record.checkOut ? (record.checkOut | date:'shortTime') : 'In progress' }}</td>
                  <td class="text-surface-600 text-sm">{{ record.totalHours ? (record.totalHours | number:'1.1-1') + 'h' : '-' }}</td>
                  <td><span [class]="getWorkModeBadge(record.workMode)">{{ record.workMode }}</span></td>
                </tr>
              }
              @if (records.length === 0) {
                <tr>
                  <td colspan="5" class="px-4 py-10 text-center text-sm text-surface-500">No attendance records found.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class MyAttendanceComponent implements OnInit {
  records: Attendance[] = [];
  todayStatus = 'Not checked in';
  todayTimeLabel = 'No entry for today';
  weekCount = 0;

  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    const employeeId = this.authService.currentUserValue?.userId || 0;
    this.attendanceService.getByEmployee(employeeId).subscribe((records: Attendance[]) => {
      this.records = records.sort((a, b) => b.attendanceDate.localeCompare(a.attendanceDate));
      this.weekCount = records.filter(record => {
        const date = new Date(record.attendanceDate);
        const now = new Date();
        const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
      }).length;

      const today = new Date().toISOString().split('T')[0];
      const todayRecord = records.find(record => record.attendanceDate === today);
      this.todayStatus = todayRecord ? (todayRecord.checkOut ? 'Completed' : 'Checked in') : 'Not checked in';
      this.todayTimeLabel = todayRecord
        ? `Check in at ${new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
        : 'No entry for today';
    });
  }

  getWorkModeBadge(mode: string): string {
    switch (mode) {
      case 'WFO': return 'badge-success';
      case 'WFH': return 'badge-info';
      case 'Hybrid': return 'badge-warning';
      default: return 'badge-neutral';
    }
  }
}
