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
import { LeaveService } from '../../services/leave.service';
import { DepartmentService } from '../../services/department.service';
import { EmployeeService } from '../../services/employee.service';
import { ReportService } from '../services/report.service';
import { KpiCard } from '../models/report.model';
import { Leave, Department } from '../../models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-leave-report',
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
          <h1 class="page-title mb-0">Leave Report</h1>
          <p class="page-subtitle mt-1">{{ isEmployeeView ? 'My leave trends' : 'Organization leave analysis' }}</p>
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
          <mat-form-field appearance="outline" style="width: 180px;">
            <mat-label>Status</mat-label>
            <mat-select [formControl]="statusFilter">
              <mat-option value="">All</mat-option>
              <mat-option value="Approved">Approved</mat-option>
              <mat-option value="Pending">Pending</mat-option>
              <mat-option value="Rejected">Rejected</mat-option>
            </mat-select>
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
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-surface-900 mb-4">Leave by Type</h3>
            <div class="chart-container">
              <canvas baseChart [data]="typeChartData" [options]="pieOptions" [type]="'pie'"></canvas>
            </div>
          </div>
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-surface-900 mb-4">Leave Status</h3>
            <div class="chart-container">
              <canvas baseChart [data]="statusChartData" [options]="doughnutOptions" [type]="'doughnut'"></canvas>
            </div>
          </div>
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-surface-900 mb-4">Monthly Trend</h3>
            <div class="chart-container">
              <canvas baseChart [data]="monthChartData" [options]="barOptions" [type]="'bar'"></canvas>
            </div>
          </div>
        </div>

        @if (!isEmployeeView) {
          <div class="card p-6 mb-6">
            <h3 class="text-lg font-semibold text-surface-900 mb-4">Leave by Department</h3>
            <div class="chart-container" style="height:300px;">
              <canvas baseChart [data]="deptChartData" [options]="barOptions" [type]="'bar'"></canvas>
            </div>
          </div>
        }

        <div class="mat-elevation-z2" style="background: white; border-radius: 12px; overflow: hidden;">
          <div style="padding: 16px 24px; font-weight: 600; color: #1e293b; border-bottom: 1px solid #f1f5f9;">
            Leave Records ({{ dataSource.filteredData.length }})
          </div>
          <table mat-table [dataSource]="dataSource" matSort class="w-full">
            <ng-container matColumnDef="employeeName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Employee</th>
              <td mat-cell *matCellDef="let r">{{ r.employeeName }}</td>
            </ng-container>
            <ng-container matColumnDef="leaveType">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Type</th>
              <td mat-cell *matCellDef="let r">{{ r.leaveType }}</td>
            </ng-container>
            <ng-container matColumnDef="fromDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>From</th>
              <td mat-cell *matCellDef="let r">{{ r.fromDate | date:'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="toDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>To</th>
              <td mat-cell *matCellDef="let r">{{ r.toDate | date:'mediumDate' }}</td>
            </ng-container>
            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Reason</th>
              <td mat-cell *matCellDef="let r" style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">{{ r.reason }}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
              <td mat-cell *matCellDef="let r">
                <mat-chip [class.badge-approved]="r.status === 'Approved'" [class.badge-pending]="r.status === 'Pending'" [class.badge-rejected]="r.status === 'Rejected'" [class.badge-cancelled]="r.status === 'Cancelled'">
                  {{ r.status }}
                </mat-chip>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            @if (dataSource.filteredData.length === 0) {
              <tr><td [attr.colspan]="displayedColumns.length" style="text-align:center;padding:48px;color:#94a3b8;">No leave records found</td></tr>
            }
          </table>
          <mat-paginator [pageSizeOptions]="[5,10,25,50]" showFirstLastButtons></mat-paginator>
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-container { position: relative; width: 100%; height: 260px; }
    .badge-approved { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .badge-pending { --mat-chip-selected-row-color: #fef3c7 !important; color: #92400e !important; }
    .badge-rejected { --mat-chip-selected-row-color: #fef2f2 !important; color: #991b1b !important; }
    .badge-cancelled { --mat-chip-selected-row-color: #f1f5f9 !important; color: #64748b !important; }
  `]
})
export class LeaveReportComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private leaveService = inject(LeaveService);
  private departmentService = inject(DepartmentService);
  private employeeService = inject(EmployeeService);
  private reportService = inject(ReportService);
  private authService = inject(AuthService);

  loading = true;
  isEmployeeView = this.authService.currentUserValue?.roleName === 'Employee';
  records: Leave[] = [];
  employees: any[] = [];
  departments: Department[] = [];
  dataSource = new MatTableDataSource<Leave>([]);
  displayedColumns = ['employeeName', 'leaveType', 'fromDate', 'toDate', 'reason', 'status'];

  startDate = new FormControl(this.getDefaultStart());
  endDate = new FormControl(new Date());
  deptFilter = new FormControl('');
  statusFilter = new FormControl('');

  kpiCards: KpiCard[] = [];

  typeChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }] };
  statusChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0, spacing: 4 }] };
  monthChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: [], borderRadius: 6 }] };
  deptChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: [], borderRadius: 6 }] };

  pieOptions: ChartOptions<'pie'> = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12 } } } };
  doughnutOptions: ChartOptions<'doughnut'> = { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 12 } } } };
  barOptions: ChartOptions<'bar'> = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } } };

  private colors = ['rgba(99,102,241,0.8)', 'rgba(236,72,153,0.8)', 'rgba(34,197,94,0.8)', 'rgba(251,191,36,0.8)', 'rgba(239,68,68,0.8)'];

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private getDefaultStart(): Date {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d;
  }

  private loadData(): void {
    forkJoin({
      employees: this.employeeService.getAll(),
      departments: this.departmentService.getAll(),
      leaves: this.leaveService.getAll(),
    }).subscribe(({ employees, departments, leaves }: { employees: any[]; departments: Department[]; leaves: Leave[] }) => {
      this.employees = employees;
      this.departments = departments;
      this.records = leaves;
      if (this.isEmployeeView) {
        const empId = this.authService.currentUserValue?.userId || 0;
        this.records = leaves.filter(r => r.empId === empId);
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
    const status = this.statusFilter.value;

    let filtered = this.records;
    if (start) filtered = filtered.filter(r => r.fromDate >= start);
    if (end) filtered = filtered.filter(r => r.toDate <= end);
    if (status) filtered = filtered.filter(r => r.status === status);
    if (deptId) {
      const deptNum = Number(deptId);
      const emps = this.employees.filter((e: any) => e.departmentId === deptNum).map((e: any) => e.employeeId);
      filtered = filtered.filter(r => emps.includes(r.empId));
    }

    this.dataSource.data = filtered;
    this.buildKpis();
    this.buildCharts();
  }

  private buildKpis(): void {
    const data = this.dataSource.data;
    const approved = data.filter(r => r.status === 'Approved').length;
    const pending = data.filter(r => r.status === 'Pending').length;
    const rejected = data.filter(r => r.status === 'Rejected').length;

    this.kpiCards = [
      { label: 'Total Requests', value: data.length, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-primary-100 text-primary-600' },
      { label: 'Approved', value: approved, subtext: data.length > 0 ? `${Math.round(approved/data.length*100)}% rate` : '', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-emerald-100 text-emerald-600' },
      { label: 'Pending', value: pending, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-amber-100 text-amber-600' },
      { label: 'Rejected', value: rejected, icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-red-100 text-red-600' },
    ];
  }

  private buildCharts(): void {
    const data = this.dataSource.data;

    const typeMap = new Map<string, number>();
    data.forEach(r => typeMap.set(r.leaveType, (typeMap.get(r.leaveType) || 0) + 1));
    this.typeChartData = {
      labels: Array.from(typeMap.keys()),
      datasets: [{ data: Array.from(typeMap.values()), backgroundColor: this.colors.slice(0, typeMap.size), borderWidth: 0 }],
    };

    const approved = data.filter(r => r.status === 'Approved').length;
    const pending = data.filter(r => r.status === 'Pending').length;
    const rejected = data.filter(r => r.status === 'Rejected').length;
    this.statusChartData = {
      labels: ['Approved', 'Pending', 'Rejected'],
      datasets: [{ data: [approved, pending, rejected], backgroundColor: ['rgba(34,197,94,0.85)', 'rgba(251,191,36,0.85)', 'rgba(239,68,68,0.85)'], borderWidth: 0, spacing: 4 }],
    };

    const monthMap = new Map<string, number>();
    data.forEach(r => {
      const month = r.fromDate.substring(0, 7);
      monthMap.set(month, (monthMap.get(month) || 0) + 1);
    });
    const sortedMonths = Array.from(monthMap.keys()).sort();
    this.monthChartData = {
      labels: sortedMonths,
      datasets: [{ data: sortedMonths.map(m => monthMap.get(m) || 0), backgroundColor: this.colors.map(c => c.replace('0.8', '0.7')), borderRadius: 6 }],
    };

    if (!this.isEmployeeView && this.employees.length > 0) {
      const deptMap = new Map<string, number>();
      data.forEach(r => {
        const emp = this.employees.find((e: any) => e.employeeId === r.empId);
        const name = emp?.departmentName || 'Unknown';
        deptMap.set(name, (deptMap.get(name) || 0) + 1);
      });
      this.deptChartData = {
        labels: Array.from(deptMap.keys()),
        datasets: [{ data: Array.from(deptMap.values()), backgroundColor: this.colors.slice(0, deptMap.size), borderRadius: 6 }],
      };
    }
  }

  exportCsv(): void {
    const headers = ['Employee', 'Leave Type', 'From', 'To', 'Reason', 'Status', 'Applied On'];
    const rows = this.dataSource.data.map(r => [
      r.employeeName, r.leaveType, r.fromDate, r.toDate, r.reason || '', r.status, r.appliedOn,
    ]);
    this.reportService.exportToCsv('leave-report', headers, rows);
  }

  printReport(): void {
    this.reportService.printReport('Leave Report');
  }
}
