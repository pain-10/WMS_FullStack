import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Chart, registerables } from 'chart.js';
import { AttendanceService } from '../services/attendance.service';
import { AuthService } from '../../services/auth.service';
import { Attendance } from '../models/attendance.model';

Chart.register(...registerables);

@Component({
  selector: 'app-timesheet',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="page-header">
        <h1 class="page-title">Timesheet</h1>
        <p class="page-subtitle">Monthly attendance summary and analytics</p>
      </div>

      @if (loading) {
        <div style="display: flex; justify-content: center; padding: 64px;">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <mat-card>
            <mat-card-content class="p-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                <mat-icon class="text-primary-600">calendar_today</mat-icon>
              </div>
              <div>
                <p class="text-xs text-surface-500">Days Present</p>
                <p class="text-xl font-bold text-surface-900">{{ daysPresent }} / {{ totalDays }}</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content class="p-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center flex-shrink-0">
                <mat-icon class="text-accent-600">schedule</mat-icon>
              </div>
              <div>
                <p class="text-xs text-surface-500">Total Hours</p>
                <p class="text-xl font-bold text-surface-900">{{ totalHours }}h</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content class="p-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <mat-icon class="text-amber-600">trending_up</mat-icon>
              </div>
              <div>
                <p class="text-xs text-surface-500">Avg Hours/Day</p>
                <p class="text-xl font-bold text-surface-900">{{ avgHours }}h</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content class="p-4 flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                <mat-icon class="text-red-600">block</mat-icon>
              </div>
              <div>
                <p class="text-xs text-surface-500">Absent Days</p>
                <p class="text-xl font-bold text-surface-900">{{ absentDays }}</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="grid gap-6 lg:grid-cols-2">
          <mat-card>
            <mat-card-content class="p-6">
              <h3 class="text-lg font-semibold text-surface-900 mb-4">Attendance Trend (Last 30 Days)</h3>
              <div class="chart-container"><canvas #attendanceTrendChart></canvas></div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-content class="p-6">
              <h3 class="text-lg font-semibold text-surface-900 mb-4">Work Mode Distribution</h3>
              <div class="chart-container"><canvas #workModeChart></canvas></div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-container { position: relative; width: 100%; height: 300px; }
  `]
})
export class TimesheetComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('attendanceTrendChart') attendanceTrendChartRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('workModeChart') workModeChartRef?: ElementRef<HTMLCanvasElement>;

  loading = true;
  records: Attendance[] = [];
  isAdmin = false;

  daysPresent = 0;
  totalDays = 0;
  totalHours = 0;
  avgHours = 0;
  absentDays = 0;

  private trendChart?: Chart;
  private modeChart?: Chart;
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    const role = this.authService.userRole;
    this.isAdmin = role === 'Admin' || role === 'Manager';
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.renderCharts();
  }

  private loadData(): void {
    const employeeId = this.authService.currentUserValue?.userId || 0;
    const obs = this.isAdmin
      ? this.attendanceService.getAll()
      : this.attendanceService.getByEmployee(employeeId);

    obs.subscribe(records => {
      this.records = records;
      this.computeMonthlySummary();
      this.loading = false;
      setTimeout(() => this.renderCharts());
    });
  }

  private computeMonthlySummary(): void {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    this.totalDays = endOfMonth.getDate();

    const monthRecords = this.records.filter(r => {
      const d = new Date(r.attendanceDate);
      return d >= startOfMonth && d <= endOfMonth;
    });

    this.daysPresent = monthRecords.length;
    this.absentDays = this.totalDays - this.daysPresent;

    this.totalHours = monthRecords.reduce((sum, r) => sum + (r.totalHours || 0), 0);
    this.avgHours = this.daysPresent > 0 ? Math.round((this.totalHours / this.daysPresent) * 10) / 10 : 0;
    this.totalHours = Math.round(this.totalHours * 10) / 10;
  }

  private renderCharts(): void {
    if (!this.attendanceTrendChartRef?.nativeElement || !this.workModeChartRef?.nativeElement) return;
    if (this.records.length === 0) return;

    this.destroyCharts();

    const last30Days: string[] = [];
    const attendanceCounts: number[] = [];

    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      last30Days.push(label);
      const count = this.records.filter(r => r.attendanceDate === dateStr).length;
      attendanceCounts.push(count);
    }

    this.trendChart = new Chart(this.attendanceTrendChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: last30Days,
        datasets: [{
          label: 'Attendance',
          data: attendanceCounts,
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#6366f1',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        },
      },
    });

    const wfo = this.records.filter(r => r.workMode === 'WFO').length;
    const wfh = this.records.filter(r => r.workMode === 'WFH').length;
    const hybrid = this.records.filter(r => r.workMode === 'Hybrid').length;

    this.modeChart = new Chart(this.workModeChartRef.nativeElement, {
      type: 'pie',
      data: {
        labels: ['WFO', 'WFH', 'Hybrid'],
        datasets: [{
          data: [wfo, wfh, hybrid],
          backgroundColor: ['#22c55e', '#3b82f6', '#a855f7'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } },
        },
      },
    });
  }

  private destroyCharts(): void {
    this.trendChart?.destroy();
    this.modeChart?.destroy();
    this.trendChart = undefined;
    this.modeChart = undefined;
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }
}
