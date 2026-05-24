import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import { AttendanceService } from '../../services/attendance.service';
import { DepartmentService } from '../../services/department.service';
import { EmployeeService } from '../../services/employee.service';
import { ReportService } from '../services/report.service';
import { KpiCard } from '../models/report.model';
import { Attendance, Department, Employee } from '../../models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-attendance-report',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatChipsModule,
    MatDatepickerModule, MatNativeDateModule,
    BaseChartDirective,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button routerLink="/reports"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h1 class="page-title mb-0">Attendance Report</h1>
          <p class="page-subtitle mt-1">{{ isEmployeeView ? 'My attendance trends' : 'Organization attendance trends and analysis' }}</p>
        </div>
      </div>

      @if (loading) {
        <div style="display: flex; justify-content: center; padding: 80px;">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else {
        <div class="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
          @for (kpi of kpiCards; track kpi.label) {
            <div class="stat-card">
              <div [class]="kpi.color + ' w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0'">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path [attr.d]="kpi.icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                </svg>
              </div>
              <div>
                <p class="text-sm text-surface-500">{{ kpi.label }}</p>
                <p class="text-2xl font-bold text-surface-900">{{ kpi.value }}</p>
                @if (kpi.subtext) {
                  <p class="text-xs text-surface-400 mt-1">{{ kpi.subtext }}</p>
                }
              </div>
            </div>
          }
        </div>

        <div style="display: flex; gap: 16px; flex-wrap: wrap; align-items: center; margin-bottom: 24px; background: white; padding: 16px 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
          <mat-form-field appearance="outline" style="width: 180px;">
            <mat-label>Start Date</mat-label>
            <input matInput [matDatepicker]="startPicker" [formControl]="startDate">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline" style="width: 180px;">
            <mat-label>End Date</mat-label>
            <input matInput [matDatepicker]="endPicker" [formControl]="endDate">
            <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
            <mat-datepicker #endPicker></mat-datepicker>
          </mat-form-field>
          @if (!isEmployeeView) {
            <mat-form-field appearance="outline" style="width: 200px;">
              <mat-label>Department</mat-label>
              <mat-select [formControl]="deptFilter">
                <mat-option value="">All</mat-option>
                @for (d of departments; track d.departmentId) {
                  <mat-option [value]="d.departmentId">{{ d.departmentName }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          }
          <mat-form-field appearance="outline" style="flex:1;min-width:200px;">
            <mat-label>Search</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Search employee...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <button mat-stroked-button (click)="applyDateFilter()" color="primary">
            <mat-icon>filter_alt</mat-icon> Apply
          </button>
          <button mat-stroked-button (click)="exportCsv()">
            <mat-icon>download</mat-icon> CSV
          </button>
          <button mat-stroked-button (click)="printReport()">
            <mat-icon>print</mat-icon> Print
          </button>
        </div>

        <div class="grid gap-6 lg:grid-cols-3 mb-6">
          <div class="card p-6 lg:col-span-2">
            <h3 class="text-lg font-semibold text-surface-900 mb-4">Attendance Trend</h3>
            <div class="chart-container">
              <canvas baseChart [data]="trendChartData" [options]="trendOptions" [type]="'line'"></canvas>
            </div>
          </div>
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-surface-900 mb-4">Work Mode</h3>
            <div class="chart-container">
              <canvas baseChart [data]="workModeChartData" [options]="doughnutOptions" [type]="'doughnut'"></canvas>
            </div>
          </div>
        </div>

        @if (!isEmployeeView) {
          <div class="card p-6 mb-6">
            <h3 class="text-lg font-semibold text-surface-900 mb-4">Attendance by Department</h3>
            <div class="chart-container" style="height:300px;">
              <canvas baseChart [data]="deptChartData" [options]="barOptions" [type]="'bar'"></canvas>
            </div>
          </div>
        }

        <div class="mat-elevation-z2" style="background: white; border-radius: 12px; overflow: hidden;">
          <div style="padding: 16px 24px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;">
            Attendance Records ({{ dataSource.filteredData.length }})
          </div>
          <table mat-table [dataSource]="dataSource" matSort class="w-full">
            <ng-container matColumnDef="employeeName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Employee</th>
              <td mat-cell *matCellDef="let r">{{ r.employeeName }}</td>
            </ng-container>
            <ng-container matColumnDef="attendanceDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Date</th>
              <td mat-cell *matCellDef="let r">{{ r.attendanceDate | date:'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="checkIn">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Check In</th>
              <td mat-cell *matCellDef="let r">{{ r.checkIn | date:'shortTime' }}</td>
            </ng-container>
            <ng-container matColumnDef="checkOut">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Check Out</th>
              <td mat-cell *matCellDef="let r">{{ r.checkOut ? (r.checkOut | date:'shortTime') : '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="totalHours">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Hours</th>
              <td mat-cell *matCellDef="let r">{{ r.totalHours ? (r.totalHours | number:'1.1-1') : '-' }}</td>
            </ng-container>
            <ng-container matColumnDef="workMode">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Mode</th>
              <td mat-cell *matCellDef="let r">
                <mat-chip [class.badge-success]="r.workMode === 'WFO'" [class.badge-info]="r.workMode === 'WFH'" [class.badge-warning]="r.workMode === 'Hybrid'">
                  {{ r.workMode }}
                </mat-chip>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            @if (dataSource.filteredData.length === 0) {
              <tr><td [attr.colspan]="displayedColumns.length" style="text-align:center;padding:48px;color:#94a3b8;">No attendance records found</td></tr>
            }
          </table>
          <mat-paginator [pageSizeOptions]="[5,10,25,50]" showFirstLastButtons></mat-paginator>
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-container { position: relative; width: 100%; height: 260px; }
    .badge-success { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .badge-info { --mat-chip-selected-row-color: #dbeafe !important; color: #1e40af !important; }
    .badge-warning { --mat-chip-selected-row-color: #fef3c7 !important; color: #92400e !important; }
  `]
})
export class AttendanceReportComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private attendanceService = inject(AttendanceService);
  private departmentService = inject(DepartmentService);
  private employeeService = inject(EmployeeService);
  private reportService = inject(ReportService);
  private authService = inject(AuthService);

  loading = true;
  isEmployeeView = this.authService.currentUserValue?.roleName === 'Employee';
  records: Attendance[] = [];
  employees: Employee[] = [];
  departments: Department[] = [];
  dataSource = new MatTableDataSource<Attendance>([]);
  displayedColumns = ['employeeName', 'attendanceDate', 'checkIn', 'checkOut', 'totalHours', 'workMode'];

  startDate = new FormControl(this.getDefaultStart());
  endDate = new FormControl(new Date());
  deptFilter = new FormControl('');
  searchControl = new FormControl('');

  kpiCards: KpiCard[] = [];

  trendChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  workModeChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [] };
  deptChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  trendOptions: ChartOptions<'line'> = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } } };
  doughnutOptions: ChartOptions<'doughnut'> = { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } } } };
  barOptions: ChartOptions<'bar'> = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } } };

  private colors = ['rgba(99,102,241,0.8)', 'rgba(236,72,153,0.8)', 'rgba(34,197,94,0.8)', 'rgba(251,191,36,0.8)', 'rgba(239,68,68,0.8)', 'rgba(168,85,247,0.8)'];

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private getDefaultStart(): Date {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  }

  private loadData(): void {
    forkJoin({
      employees: this.employeeService.getAll(),
      departments: this.departmentService.getAll(),
      attendance: this.attendanceService.getAll(),
    }).subscribe(({ employees, departments, attendance }) => {
      this.employees = employees;
      this.departments = departments;
      this.records = attendance;
      if (this.isEmployeeView) {
        const empId = this.authService.currentUserValue?.userId || 0;
        this.records = attendance.filter(r => r.empId === empId);
      }
      this.applyDateFilter();
      this.buildKpis();
      this.buildCharts();
      this.loading = false;
    });
  }

  applyDateFilter(): void {
    const start = this.startDate.value ? new Date(this.startDate.value).toISOString().split('T')[0] : '';
    const end = this.endDate.value ? new Date(this.endDate.value).toISOString().split('T')[0] : '';
    const deptId = this.deptFilter.value;

    let filtered = this.records;
    if (start) filtered = filtered.filter(r => r.attendanceDate >= start);
    if (end) filtered = filtered.filter(r => r.attendanceDate <= end);
    if (deptId) {
      const deptNum = Number(deptId);
      const deptEmpIds = this.employees.filter(e => e.departmentId === deptNum).map(e => e.employeeId);
      filtered = filtered.filter(r => deptEmpIds.includes(r.empId));
    }

    this.dataSource.data = filtered;
    this.buildKpis();
    this.buildCharts();
  }

  private buildKpis(): void {
    const data = this.dataSource.data;
    const total = data.length;
    const checkedOut = data.filter(r => r.checkOut).length;
    const avgHours = data.length > 0
      ? data.reduce((sum, r) => sum + (r.totalHours || 0), 0) / data.length
      : 0;
    const wfo = data.filter(r => r.workMode === 'WFO').length;
    const wfh = data.filter(r => r.workMode === 'WFH').length;
    const hybrid = data.filter(r => r.workMode === 'Hybrid').length;

    this.kpiCards = [
      { label: 'Total Records', value: total, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-primary-100 text-primary-600' },
      { label: 'Checked Out', value: checkedOut, subtext: total > 0 ? `${Math.round(checkedOut/total*100)}% completed` : '', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-emerald-100 text-emerald-600' },
      { label: 'Avg Hours', value: avgHours.toFixed(1), icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-amber-100 text-amber-600' },
      { label: 'WFO / WFH / Hybrid', value: `${wfo}/${wfh}/${hybrid}`, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'bg-violet-100 text-violet-600' },
    ];
  }

  private buildCharts(): void {
    const data = this.dataSource.data;

    const dateMap = new Map<string, number>();
    data.forEach(r => {
      dateMap.set(r.attendanceDate, (dateMap.get(r.attendanceDate) || 0) + 1);
    });
    const sortedDates = Array.from(dateMap.keys()).sort();
    this.trendChartData = {
      labels: sortedDates,
      datasets: [{
        label: 'Present',
        data: sortedDates.map(d => dateMap.get(d) || 0),
        borderColor: 'rgba(99,102,241,1)',
        backgroundColor: 'rgba(99,102,241,0.1)',
        tension: 0.4,
        fill: true,
      }],
    };

    const wfo = data.filter(r => r.workMode === 'WFO').length;
    const wfh = data.filter(r => r.workMode === 'WFH').length;
    const hybrid = data.filter(r => r.workMode === 'Hybrid').length;
    this.workModeChartData = {
      labels: ['WFO', 'WFH', 'Hybrid'],
      datasets: [{ data: [wfo, wfh, hybrid], backgroundColor: ['rgba(34,197,94,0.85)', 'rgba(99,102,241,0.85)', 'rgba(251,191,36,0.85)'], borderWidth: 0, spacing: 4 }],
    };

    if (!this.isEmployeeView) {
      const deptAttendance = new Map<string, number>();
      data.forEach(r => {
        const emp = this.employees.find(e => e.employeeId === r.empId);
        const name = emp?.departmentName || 'Unknown';
        deptAttendance.set(name, (deptAttendance.get(name) || 0) + 1);
      });
      this.deptChartData = {
        labels: Array.from(deptAttendance.keys()),
        datasets: [{ data: Array.from(deptAttendance.values()), backgroundColor: this.colors.slice(0, deptAttendance.size), borderRadius: 6 }],
      };
    }
  }

  exportCsv(): void {
    const headers = ['Employee', 'Date', 'Check In', 'Check Out', 'Hours', 'Work Mode'];
    const rows = this.dataSource.data.map(r => [
      r.employeeName, r.attendanceDate, r.checkIn, r.checkOut || '', r.totalHours || '', r.workMode,
    ]);
    this.reportService.exportToCsv('attendance-report', headers, rows);
  }

  printReport(): void {
    this.reportService.printReport('Attendance Report');
  }
}
