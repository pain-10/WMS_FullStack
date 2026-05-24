import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AttendanceService } from './services/attendance.service';
import { Attendance, WORK_MODES } from './models/attendance.model';
import { AuthService } from '../services/auth.service';
import { EmployeeService } from '../services/employee.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="page-header flex items-center justify-between">
        <div>
          <h1 class="page-title">Attendance</h1>
          <p class="page-subtitle">{{ isAdmin ? 'Manage employee attendance records' : 'Mark your daily attendance' }}</p>
        </div>
      </div>

      <!-- TODAY'S ATTENDANCE CARD - Employee only -->
      <div *ngIf="!isAdmin" class="card p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-surface-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            Today's Attendance
          </h2>
          <span class="text-sm text-surface-500">{{ todayDate | date:'fullDate' }}</span>
        </div>

        <div class="flex items-center gap-2 mb-6">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                [class.bg-amber-100]="statusText === 'Not Checked In'"
                [class.text-amber-700]="statusText === 'Not Checked In'"
                [class.bg-accent-100]="statusText === 'Checked In'"
                [class.text-accent-700]="statusText === 'Checked In'"
                [class.bg-surface-100]="statusText === 'Checked Out'"
                [class.text-surface-600]="statusText === 'Checked Out'">
            <span class="w-2 h-2 rounded-full mr-1"
                  [class.bg-amber-500]="statusText === 'Not Checked In'"
                  [class.bg-accent-500]="statusText === 'Checked In'"
                  [class.bg-surface-400]="statusText === 'Checked Out'"></span>
            {{ statusText }}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div class="p-3 rounded-xl bg-surface-50">
            <p class="text-xs text-surface-500">Check In Time</p>
            <p class="text-lg font-semibold text-surface-900">{{ formatTime(todayRecord?.checkIn) }}</p>
          </div>
          <div class="p-3 rounded-xl bg-surface-50">
            <p class="text-xs text-surface-500">Check Out Time</p>
            <p class="text-lg font-semibold text-surface-900">{{ formatTime(todayRecord?.checkOut) }}</p>
          </div>
          <div class="p-3 rounded-xl bg-surface-50">
            <p class="text-xs text-surface-500">Total Hours</p>
            <p class="text-lg font-semibold text-surface-900">{{ totalHoursLabel }}</p>
          </div>
          <div class="p-3 rounded-xl bg-surface-50">
            <p class="text-xs text-surface-500">Work Mode</p>
            <p class="text-lg font-semibold text-surface-900">{{ todayRecord?.workMode || '--' }}</p>
          </div>
        </div>

        <div *ngIf="!isCheckedIn" class="mb-4">
          <label class="input-label">Work Mode</label>
          <select class="input-field w-auto" [(ngModel)]="selectedWorkMode">
            <option *ngFor="let mode of workModes" [value]="mode">{{ modeLabel(mode) }}</option>
          </select>
        </div>

        <div class="flex gap-3">
          <button (click)="handleCheckIn()"
                  [disabled]="isCheckedIn || checkingIn"
                  class="btn-primary" id="checkin-btn">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
            Check In
          </button>
          <button (click)="handleCheckOut()"
                  [disabled]="!isCheckedIn || isCheckedOut || checkingOut"
                  class="btn-warning" id="checkout-btn">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Check Out
          </button>
          <span *ngIf="checkingIn || checkingOut" class="text-sm text-surface-400 self-center ml-2">
            <mat-icon class="inline align-text-bottom animate-spin">refresh</mat-icon> Processing...
          </span>
        </div>
      </div>

      <!-- ADMIN STATS CARDS -->
      <div *ngIf="isAdmin" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="card p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center flex-shrink-0">
            <mat-icon class="text-accent-600">check_circle</mat-icon>
          </div>
          <div>
            <p class="text-xs text-surface-500">Present Today</p>
            <p class="text-xl font-bold text-surface-900">{{ presentToday }}</p>
          </div>
        </div>
        <div class="card p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <mat-icon class="text-red-600">cancel</mat-icon>
          </div>
          <div>
            <p class="text-xs text-surface-500">Absent Today</p>
            <p class="text-xl font-bold text-surface-900">{{ absentToday }}</p>
          </div>
        </div>
        <div class="card p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
            <mat-icon class="text-primary-600">business</mat-icon>
          </div>
          <div>
            <p class="text-xs text-surface-500">WFO</p>
            <p class="text-xl font-bold text-surface-900">{{ wfoCount }}</p>
          </div>
        </div>
        <div class="card p-4 flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
            <mat-icon class="text-violet-600">home</mat-icon>
          </div>
          <div>
            <p class="text-xs text-surface-500">WFH</p>
            <p class="text-xl font-bold text-surface-900">{{ wfhCount }}</p>
          </div>
        </div>
      </div>

      <!-- RECORDS SECTION -->
      <div class="card">
        <div class="p-4 border-b border-surface-200">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 class="text-lg font-semibold text-surface-900">
              {{ isAdmin ? 'All Attendance Records' : 'My Attendance History' }}
            </h3>
            <div *ngIf="isAdmin" class="flex gap-2">
              <button (click)="exportToCSV()" class="btn-secondary text-sm flex items-center gap-1">
                <mat-icon class="text-sm">download</mat-icon>
                Export CSV
              </button>
            </div>
          </div>
        </div>

        <div class="p-4">
          <div class="flex flex-wrap gap-3 items-center">
            <mat-form-field appearance="outline" class="!mb-0" style="min-width: 200px; flex: 1;">
              <mat-label>{{ isAdmin ? 'Search by name or ID' : 'Search by date' }}</mat-label>
              <input matInput [formControl]="searchControl" placeholder="{{ isAdmin ? 'Type name or ID...' : 'Type date...' }}">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="!mb-0" style="width: 120px;">
              <mat-label>Month</mat-label>
              <mat-select [(value)]="selectedMonth">
                <mat-option *ngFor="let m of months; let i = index" [value]="i">{{ m }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="!mb-0" style="width: 100px;">
              <mat-label>Year</mat-label>
              <mat-select [(value)]="selectedYear" (selectionChange)="applyFilters()">
                <mat-option *ngFor="let y of years" [value]="y">{{ y }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field *ngIf="isAdmin" appearance="outline" class="!mb-0" style="width: 130px;">
              <mat-label>Work Mode</mat-label>
              <mat-select [formControl]="workModeFilter" (selectionChange)="applyFilters()">
                <mat-option value="">All</mat-option>
                <mat-option *ngFor="let mode of workModes" [value]="mode">{{ mode }}</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field *ngIf="isAdmin" appearance="outline" class="!mb-0" style="width: 130px;">
              <mat-label>Status</mat-label>
              <mat-select [formControl]="statusFilter" (selectionChange)="applyFilters()">
                <mat-option value="">All</mat-option>
                <mat-option value="Completed">Completed</mat-option>
                <mat-option value="Active">Active</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-stroked-button (click)="resetFilters()" class="!h-14">
              <mat-icon>refresh</mat-icon>
              Reset
            </button>
          </div>
        </div>

        <div *ngIf="loading" class="flex justify-center py-12">
          <mat-spinner diameter="40"></mat-spinner>
        </div>

        <div *ngIf="!loading" class="table-container">
          <table mat-table [dataSource]="dataSource" matSort class="attendance-table">
            <ng-container matColumnDef="empId">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Emp ID </th>
              <td mat-cell *matCellDef="let row"> {{ row.empId }} </td>
            </ng-container>

            <ng-container matColumnDef="employeeName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Employee </th>
              <td mat-cell *matCellDef="let row">
                <span class="font-medium text-surface-900">{{ row.employeeName }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="attendanceDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Date </th>
              <td mat-cell *matCellDef="let row"> {{ row.attendanceDate | date:'mediumDate' }} </td>
            </ng-container>

            <ng-container matColumnDef="checkIn">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Check In </th>
              <td mat-cell *matCellDef="let row">
                <mat-chip class="checkin-chip">{{ row.checkIn | date:'shortTime' }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="checkOut">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Check Out </th>
              <td mat-cell *matCellDef="let row">
                <span *ngIf="row.checkOut">
                  <mat-chip class="checkout-chip">{{ row.checkOut | date:'shortTime' }}</mat-chip>
                </span>
                <span *ngIf="!row.checkOut">
                  <mat-chip class="inprogress-chip">In Progress</mat-chip>
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="totalHours">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Total Hours </th>
              <td mat-cell *matCellDef="let row">
                <span *ngIf="row.totalHours != null"
                      class="font-medium"
                      [class.text-accent-600]="row.totalHours >= 8"
                      [class.text-amber-600]="row.totalHours > 0 && row.totalHours < 8">
                  {{ row.totalHours | number:'1.1-1' }}h
                </span>
                <span *ngIf="row.totalHours == null" class="text-surface-400">--</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="workMode">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Work Mode </th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [class.wfo-chip]="row.workMode === 'WFO'"
                          [class.wfh-chip]="row.workMode === 'WFH'"
                          [class.hybrid-chip]="row.workMode === 'Hybrid'">
                  {{ row.workMode }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
              <td mat-cell *matCellDef="let row">
                <mat-chip *ngIf="row.checkOut" class="completed-chip">Completed</mat-chip>
                <mat-chip *ngIf="!row.checkOut" class="pending-chip">Active</mat-chip>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            <tr class="mat-row" *ngIf="dataSource.filteredData.length === 0">
              <td class="mat-cell text-center py-12 text-surface-400" [attr.colspan]="displayedColumns.length">
                <mat-icon class="block text-4xl mx-auto mb-2" style="width:48px;height:48px;">fact_check</mat-icon>
                No attendance records found
              </td>
            </tr>
          </table>
        </div>

        <mat-paginator *ngIf="!loading"
                       [pageSizeOptions]="[5, 10, 25, 50]"
                       showFirstLastButtons
                       aria-label="Select page">
        </mat-paginator>
      </div>
    </div>
  `,
  styles: [`
    .attendance-table { width: 100%; }
    .attendance-table .mat-mdc-header-cell { font-weight: 600; color: #64748b; background: #f8fafc; }
    .attendance-table .mat-mdc-cell { color: #475569; }
    .attendance-table .mat-mdc-row:hover { background: #f1f5f9; }
    .checkin-chip { --mat-chip-selected-row-color: #dbeafe !important; color: #1e40af !important; }
    .checkout-chip { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .inprogress-chip { --mat-chip-selected-row-color: #fef3c7 !important; color: #92400e !important; }
    .wfo-chip { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .wfh-chip { --mat-chip-selected-row-color: #dbeafe !important; color: #1e40af !important; }
    .hybrid-chip { --mat-chip-selected-row-color: #f3e8ff !important; color: #7c3aed !important; }
    .completed-chip { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .pending-chip { --mat-chip-selected-row-color: #fef3c7 !important; color: #92400e !important; }
    .animate-spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  `]
})
export class AttendanceComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<Attendance>([]);
  attendance: Attendance[] = [];
  todayRecord: Attendance | null = null;
  todayDate = new Date();
  loading = true;
  isAdmin = false;
  employeeId = 0;
  workModes = WORK_MODES;

  selectedWorkMode = 'WFO';
  checkingIn = false;
  checkingOut = false;

  selectedMonth: number;
  selectedYear: number;
  totalEmployees = 0;
  workModeFilter = new FormControl('');
  statusFilter = new FormControl('');
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  years: number[] = [];

  searchControl = new FormControl('');
  private todayStr = '';
  private destroy$ = new Subject<void>();

  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private snackBar = inject(MatSnackBar);

  get isCheckedIn(): boolean {
    return !!this.todayRecord;
  }

  get isCheckedOut(): boolean {
    return !!this.todayRecord?.checkOut;
  }

  get statusText(): string {
    if (!this.todayRecord) return 'Not Checked In';
    if (this.todayRecord.checkOut) return 'Checked Out';
    return 'Checked In';
  }

  get totalHoursLabel(): string {
    return this.todayRecord?.totalHours != null
      ? this.todayRecord.totalHours.toFixed(1) + 'h'
      : '0h';
  }

  get displayedColumns(): string[] {
    if (this.isAdmin) {
      return ['empId', 'employeeName', 'attendanceDate', 'checkIn', 'checkOut', 'totalHours', 'workMode', 'status'];
    }
    return ['attendanceDate', 'checkIn', 'checkOut', 'totalHours', 'workMode', 'status'];
  }

  get presentToday(): number {
    return this.attendance.filter(a => a.attendanceDate === this.todayStr && a.checkIn).length;
  }

  get wfoCount(): number {
    return this.attendance.filter(a => a.attendanceDate === this.todayStr && a.workMode === 'WFO' && a.checkIn).length;
  }

  get wfhCount(): number {
    return this.attendance.filter(a => a.attendanceDate === this.todayStr && a.workMode === 'WFH' && a.checkIn).length;
  }

  get absentToday(): number {
    return Math.max(0, this.totalEmployees - this.presentToday);
  }

  constructor() {
    const now = new Date();
    this.selectedMonth = now.getMonth();
    this.selectedYear = now.getFullYear();
    for (let y = now.getFullYear() - 2; y <= now.getFullYear() + 1; y++) {
      this.years.push(y);
    }
  }

  ngOnInit(): void {
    this.todayStr = new Date().toISOString().split('T')[0];
    const role = this.authService.userRole;
    this.isAdmin = role === 'Admin' || role === 'Manager';
    this.employeeId = this.authService.currentUserValue?.userId || 0;

    this.setupSearch();
    this.loadAttendance();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());
  }

  loadAttendance(): void {
    this.loading = true;

    if (this.isAdmin) {
      this.employeeService.getAll().subscribe({
        next: (emps) => {
          this.totalEmployees = emps.filter((e: any) => e.status === 'Active').length;
        }
      });
    }

    const obs = this.isAdmin
      ? this.attendanceService.getAll()
      : this.attendanceService.getByEmployee(this.employeeId);

    obs.subscribe({
      next: (data: Attendance[]) => {
        this.attendance = data;
        this.todayRecord = data.find(a => a.attendanceDate === this.todayStr) || null;
        if (this.todayRecord) {
          this.selectedWorkMode = this.todayRecord.workMode;
        }
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load attendance records', 'Close', { duration: 3000 });
      }
    });
  }

  handleCheckIn(): void {
    if (!this.employeeId || this.isCheckedIn || this.checkingIn) return;
    this.checkingIn = true;
    this.attendanceService.checkIn(this.employeeId, this.selectedWorkMode).subscribe({
      next: () => {
        this.snackBar.open('Attendance marked successfully', 'Close', { duration: 3000 });
        this.checkingIn = false;
        this.loadAttendance();
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Check in failed';
        this.snackBar.open(msg, 'Close', { duration: 3000 });
        this.checkingIn = false;
      }
    });
  }

  handleCheckOut(): void {
    if (!this.employeeId || !this.isCheckedIn || this.isCheckedOut || this.checkingOut) return;
    this.checkingOut = true;
    this.attendanceService.checkOut(this.employeeId).subscribe({
      next: () => {
        this.snackBar.open('Attendance marked successfully', 'Close', { duration: 3000 });
        this.checkingOut = false;
        this.loadAttendance();
      },
      error: (err: any) => {
        const msg = err?.error?.message || 'Check out failed';
        this.snackBar.open(msg, 'Close', { duration: 3000 });
        this.checkingOut = false;
      }
    });
  }

  applyFilters(): void {
    const searchTerm = this.searchControl.value || '';
    const month = this.selectedMonth;
    const year = this.selectedYear;
    const workMode = this.workModeFilter.value || '';
    const status = this.statusFilter.value || '';

    this.dataSource.filterPredicate = (data: Attendance, _filter: string) => {
      const recordDate = new Date(data.attendanceDate);
      const matchesMonth = recordDate.getMonth() === month && recordDate.getFullYear() === year;

      const matchesWorkMode = !workMode || data.workMode === workMode;
      const matchesStatus = !status ||
        (status === 'Completed' ? !!data.checkOut : !data.checkOut);

      if (this.isAdmin) {
        const query = (searchTerm || '').toString().toLowerCase();
        const matchesSearch = !query ||
          data.employeeName.toLowerCase().includes(query) ||
          data.empId.toString().includes(query) ||
          data.attendanceDate.includes(query);
        return matchesMonth && matchesSearch && matchesWorkMode && matchesStatus;
      }

      const query = (searchTerm || '').toString().toLowerCase();
      const matchesSearch = !query || data.attendanceDate.includes(query);
      return matchesMonth && matchesSearch && matchesWorkMode && matchesStatus;
    };

    this.dataSource.filter = Math.random().toString();
  }

  resetFilters(): void {
    this.selectedMonth = new Date().getMonth();
    this.selectedYear = new Date().getFullYear();
    this.workModeFilter.setValue('');
    this.statusFilter.setValue('');
    this.applyFilters();
  }

  exportToCSV(): void {
    const rows = this.dataSource.filteredData.map(r => [
      r.empId,
      r.employeeName,
      r.attendanceDate,
      r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '--',
      r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '--',
      r.totalHours != null ? r.totalHours.toFixed(1) : '--',
      r.workMode,
      r.checkOut ? 'Completed' : 'Active'
    ]);

    const headers = ['Employee ID', 'Employee Name', 'Date', 'Check In', 'Check Out', 'Total Hours', 'Work Mode', 'Status'];
    const csv = [headers, ...rows].map(row => row.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${this.todayStr}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  formatTime(dateStr: string | undefined): string {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  modeLabel(mode: string): string {
    switch (mode) {
      case 'WFO': return 'Work From Office';
      case 'WFH': return 'Work From Home';
      case 'Hybrid': return 'Hybrid';
      default: return mode;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
