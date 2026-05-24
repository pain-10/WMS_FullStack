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
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { forkJoin } from 'rxjs';
import { ProjectService } from '../../services/project.service';
import { ReportService } from '../services/report.service';
import { KpiCard } from '../models/report.model';
import { Project } from '../../models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-project-report',
  standalone: true,
  imports: [
    CommonModule, RouterLink, ReactiveFormsModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatChipsModule,
    BaseChartDirective,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button routerLink="/reports"><mat-icon>arrow_back</mat-icon></button>
        <div>
          <h1 class="page-title mb-0">Project Report</h1>
          <p class="page-subtitle mt-1">{{ isEmployeeView ? 'My assigned projects' : 'Project portfolio overview' }}</p>
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
            <h3 class="text-lg font-semibold text-surface-900 mb-4">Project Status</h3>
            <div class="chart-container">
              <canvas baseChart [data]="statusChartData" [options]="doughnutOptions" [type]="'doughnut'"></canvas>
            </div>
          </div>
          <div class="card p-6">
            <h3 class="text-lg font-semibold text-surface-900 mb-4">Project List</h3>
            <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:16px;">
              <mat-form-field appearance="outline" style="flex:1;min-width:200px;">
                <mat-label>Search</mat-label>
                <input matInput [formControl]="searchControl" placeholder="Search project...">
                <mat-icon matSuffix>search</mat-icon>
              </mat-form-field>
              <mat-form-field appearance="outline" style="width:160px;">
                <mat-label>Status</mat-label>
                <mat-select [formControl]="statusFilter">
                  <mat-option value="">All</mat-option>
                  <mat-option value="Active">Active</mat-option>
                  <mat-option value="Completed">Completed</mat-option>
                </mat-select>
              </mat-form-field>
              <button mat-stroked-button (click)="exportCsv()"><mat-icon>download</mat-icon> CSV</button>
              <button mat-stroked-button (click)="printReport()"><mat-icon>print</mat-icon> Print</button>
            </div>
            <div style="max-height:400px;overflow-y:auto;">
              <table mat-table [dataSource]="dataSource" matSort class="w-full">
                <ng-container matColumnDef="projectName">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Project</th>
                  <td mat-cell *matCellDef="let p">{{ p.projectName }}</td>
                </ng-container>
                <ng-container matColumnDef="clientName">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Client</th>
                  <td mat-cell *matCellDef="let p">{{ p.clientName || '-' }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                  <td mat-cell *matCellDef="let p">
                    <mat-chip [class.active-chip]="p.status === 'Active'" [class.completed-chip]="p.status === 'Completed'">{{ p.status }}</mat-chip>
                  </td>
                </ng-container>
                <ng-container matColumnDef="startDate">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Start</th>
                  <td mat-cell *matCellDef="let p">{{ p.startDate | date:'mediumDate' }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="projectColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: projectColumns;"></tr>
                @if (dataSource.filteredData.length === 0) {
                  <tr><td [attr.colspan]="projectColumns.length" style="text-align:center;padding:24px;color:#94a3b8;">No projects found</td></tr>
                }
              </table>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .chart-container { position: relative; width: 100%; height: 280px; }
    .active-chip { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .completed-chip { --mat-chip-selected-row-color: #dbeafe !important; color: #1e40af !important; }
  `]
})
export class ProjectReportComponent implements OnInit, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private projectService = inject(ProjectService);
  private reportService = inject(ReportService);
  private authService = inject(AuthService);

  loading = true;
  isEmployeeView = this.authService.currentUserValue?.roleName === 'Employee';
  projects: Project[] = [];
  dataSource = new MatTableDataSource<Project>([]);
  projectColumns = ['projectName', 'clientName', 'status', 'startDate'];
  searchControl = new FormControl('');
  statusFilter = new FormControl('');

  kpiCards: KpiCard[] = [];

  statusChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: [], borderWidth: 0, spacing: 4 }] };
  doughnutOptions: ChartOptions<'doughnut'> = { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } } } };

  ngOnInit(): void {
    this.loadData();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private loadData(): void {
    if (this.isEmployeeView) {
      const empId = this.authService.currentUserValue?.userId || 0;
      this.projectService.getByEmployee(empId).subscribe(projects => {
        this.projects = projects;
        this.dataSource.data = projects;
        this.buildKpis();
        this.buildCharts();
        this.loading = false;
      });
    } else {
      forkJoin({
        projects: this.projectService.getAll(),
        allocations: this.projectService.getAllocations(),
      }).subscribe(({ projects }) => {
        this.projects = projects;
        this.dataSource.data = projects;
        this.buildKpis();
        this.buildCharts();
        this.loading = false;
      });
    }
  }

  private setupFilters(): void {
    this.searchControl.valueChanges.subscribe(() => this.applyFilter());
    this.statusFilter.valueChanges.subscribe(() => this.applyFilter());
  }

  private applyFilter(): void {
    const search = (this.searchControl.value || '').trim().toLowerCase();
    const status = this.statusFilter.value;
    this.dataSource.filterPredicate = (data: Project) => {
      const matchSearch = !search || data.projectName.toLowerCase().includes(search);
      const matchStatus = !status || data.status === status;
      return matchSearch && matchStatus;
    };
    this.dataSource.filter = (search || status) || ' ';
  }

  private buildKpis(): void {
    const data = this.dataSource.data;
    const active = data.filter(p => p.status === 'Active').length;
    const completed = data.filter(p => p.status === 'Completed').length;
    const uniqueClients = new Set(data.filter(p => p.clientName).map(p => p.clientName)).size;

    this.kpiCards = [
      { label: 'Total Projects', value: data.length, icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-primary-100 text-primary-600' },
      { label: 'Active', value: active, subtext: data.length > 0 ? `${Math.round(active/data.length*100)}% of total` : '', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-emerald-100 text-emerald-600' },
      { label: 'Completed', value: completed, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-blue-100 text-blue-600' },
      { label: 'Clients', value: uniqueClients, icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', color: 'bg-violet-100 text-violet-600' },
    ];
  }

  private buildCharts(): void {
    const data = this.dataSource.data;
    const active = data.filter(p => p.status === 'Active').length;
    const completed = data.filter(p => p.status === 'Completed').length;

    this.statusChartData = {
      labels: ['Active', 'Completed'],
      datasets: [{ data: [active, completed], backgroundColor: ['rgba(34,197,94,0.85)', 'rgba(99,102,241,0.85)'], borderWidth: 0, spacing: 4 }],
    };
  }

  exportCsv(): void {
    const headers = ['Project', 'Client', 'Status', 'Start Date', 'End Date'];
    const rows = this.dataSource.data.map(p => [p.projectName, p.clientName || '', p.status, p.startDate || '', p.endDate || '']);
    this.reportService.exportToCsv('project-report', headers, rows);
  }

  printReport(): void {
    this.reportService.printReport('Project Report');
  }
}
