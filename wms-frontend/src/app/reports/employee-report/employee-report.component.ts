import { Component, OnInit, inject } from '@angular/core';
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
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { EmployeeService } from '../../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { ReportService } from '../services/report.service';
import { KpiCard } from '../models/report.model';
import { Employee, Department } from '../../models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-employee-report',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatChipsModule, MatDatepickerModule, MatNativeDateModule,
    BaseChartDirective,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button routerLink="/reports"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h1 class="page-title mb-0">Employee Report</h1>
          <p class="page-subtitle mt-1">Workforce demographics and distribution</p>
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

        <div class="grid gap-6 lg:grid-cols-2 mb-6">
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-surface-900 mb-4">Department Distribution</h3>
            <div class="chart-container">
              <canvas baseChart [data]="deptChartData" [options]="pieOptions" [type]="'pie'"></canvas>
            </div>
          </div>
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-surface-900 mb-4">Role Distribution</h3>
            <div class="chart-container">
              <canvas baseChart [data]="roleChartData" [options]="barOptions" [type]="'bar'"></canvas>
            </div>
          </div>
        </div>

        <div class="mat-elevation-z2" style="background: white; border-radius: 12px; overflow: hidden;">
          <div style="padding: 16px 24px 0; display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
            <mat-form-field appearance="outline" style="flex: 1; min-width: 280px;">
              <mat-label>Search</mat-label>
              <input matInput [formControl]="searchControl" placeholder="Search by name, email, department...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" style="width: 200px;">
              <mat-label>Department</mat-label>
              <mat-select [formControl]="deptFilter">
                <mat-option value="">All</mat-option>
                @for (d of departments; track d.departmentId) {
                  <mat-option [value]="d.departmentId">{{ d.departmentName }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button (click)="exportCsv()" style="margin-left: auto;">
              <mat-icon>download</mat-icon> CSV
            </button>
            <button mat-stroked-button (click)="printReport()">
              <mat-icon>print</mat-icon> Print
            </button>
          </div>

          <div style="position: relative; min-height: 200px;">
            <table mat-table [dataSource]="dataSource" matSort class="w-full">
              <ng-container matColumnDef="employeeId">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
                <td mat-cell *matCellDef="let e">{{ e.employeeId }}</td>
              </ng-container>
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
                <td mat-cell *matCellDef="let e">{{ e.firstName }} {{ e.lastName }}</td>
              </ng-container>
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                <td mat-cell *matCellDef="let e">{{ e.email }}</td>
              </ng-container>
              <ng-container matColumnDef="departmentName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
                <td mat-cell *matCellDef="let e">{{ e.departmentName }}</td>
              </ng-container>
              <ng-container matColumnDef="roleName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
                <td mat-cell *matCellDef="let e">{{ e.roleName }}</td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let e">
                  <mat-chip [class.active-chip]="e.status === 'Active'" [class.inactive-chip]="e.status !== 'Active'">
                    {{ e.status }}
                  </mat-chip>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              @if (dataSource.filteredData.length === 0) {
                <tr><td [attr.colspan]="displayedColumns.length" style="text-align:center;padding:48px;color:#94a3b8;">No employees found</td></tr>
              }
            </table>
          </div>
          <mat-paginator [pageSizeOptions]="[5,10,25,50]" showFirstLastButtons></mat-paginator>
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-container { position: relative; width: 100%; height: 280px; }
    .active-chip { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .inactive-chip { --mat-chip-selected-row-color: #fef2f2 !important; color: #991b1b !important; }
  `]
})
export class EmployeeReportComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private reportService = inject(ReportService);

  loading = true;
  employees: Employee[] = [];
  departments: Department[] = [];
  dataSource = new MatTableDataSource<Employee>([]);
  displayedColumns = ['employeeId', 'name', 'email', 'departmentName', 'roleName', 'status'];
  searchControl = new FormControl('');
  deptFilter = new FormControl('');

  kpiCards: KpiCard[] = [];

  deptChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0 }] };
  roleChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: [], borderRadius: 6 }] };
  pieOptions: ChartOptions<'pie'> = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } } } };
  barOptions: ChartOptions<'bar'> = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } } };

  private colors = ['rgba(99,102,241,0.8)', 'rgba(236,72,153,0.8)', 'rgba(34,197,94,0.8)', 'rgba(251,191,36,0.8)', 'rgba(239,68,68,0.8)', 'rgba(168,85,247,0.8)'];

  ngOnInit(): void {
    this.loadData();
    this.setupFilters();
  }

  private loadData(): void {
    this.employeeService.getAll().subscribe(employees => {
      this.employees = employees;
      this.dataSource.data = employees;
      this.departmentService.getAll().subscribe(depts => {
        this.departments = depts;
        this.buildKpis();
        this.buildCharts();
        this.loading = false;
      });
    });
  }

  private setupFilters(): void {
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => this.applyFilter());
    this.deptFilter.valueChanges.subscribe(() => this.applyFilter());
  }

  private applyFilter(): void {
    const search = (this.searchControl.value || '').trim().toLowerCase();
    const deptId = this.deptFilter.value;
    this.dataSource.filterPredicate = (data: Employee) => {
      const matchSearch = !search ||
        data.firstName.toLowerCase().includes(search) ||
        data.lastName.toLowerCase().includes(search) ||
        data.email.toLowerCase().includes(search) ||
        (data.departmentName || '').toLowerCase().includes(search);
      const matchDept = !deptId || data.departmentId === Number(deptId);
      return matchSearch && matchDept;
    };
    this.dataSource.filter = search;
  }

  private buildKpis(): void {
    const active = this.employees.filter(e => e.status === 'Active').length;
    const inactive = this.employees.filter(e => e.status !== 'Active').length;
    const deptCount = new Set(this.employees.map(e => e.departmentId)).size;
    this.kpiCards = [
      { label: 'Total Employees', value: this.employees.length, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'bg-primary-100 text-primary-600' },
      { label: 'Active', value: active, subtext: `${Math.round(active / this.employees.length * 100)}% of workforce`, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-emerald-100 text-emerald-600' },
      { label: 'Inactive', value: inactive, icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-red-100 text-red-600' },
      { label: 'Departments', value: deptCount, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'bg-violet-100 text-violet-600' },
    ];
  }

  private buildCharts(): void {
    const deptMap = new Map<string, number>();
    this.employees.forEach(e => {
      const name = e.departmentName || 'Unassigned';
      deptMap.set(name, (deptMap.get(name) || 0) + 1);
    });
    this.deptChartData = {
      labels: Array.from(deptMap.keys()),
      datasets: [{ data: Array.from(deptMap.values()), backgroundColor: this.colors.slice(0, deptMap.size), borderWidth: 0 }],
    };

    const roleMap = new Map<string, number>();
    this.employees.forEach(e => {
      const name = e.roleName || 'Unassigned';
      roleMap.set(name, (roleMap.get(name) || 0) + 1);
    });
    this.roleChartData = {
      labels: Array.from(roleMap.keys()),
      datasets: [{ data: Array.from(roleMap.values()), backgroundColor: this.colors.slice(0, roleMap.size), borderRadius: 6 }],
    };
  }

  exportCsv(): void {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Department', 'Role', 'Status'];
    const rows = this.employees.map(e => [e.employeeId, e.firstName, e.lastName, e.email, e.phoneNumber, e.departmentName || '', e.roleName || '', e.status]);
    this.reportService.exportToCsv('employee-report', headers, rows);
  }

  printReport(): void {
    this.reportService.printReport('Employee Report');
  }
}
