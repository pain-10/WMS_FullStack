import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { AttendanceService } from '../services/attendance.service';
import { AuthService } from '../../services/auth.service';
import { Attendance, WORK_MODES } from '../models/attendance.model';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="page-header">
        <h1 class="page-title">Attendance Records</h1>
        <p class="page-subtitle">View and manage employee attendance</p>
      </div>

      <div class="mat-elevation-z2" style="background: white; border-radius: 12px; overflow: hidden;">
        <div style="padding: 16px 24px 0; display: flex; gap: 16px; flex-wrap: wrap;">
          <mat-form-field appearance="outline" style="flex: 1; min-width: 240px;">
            <mat-label>Search by name</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Search employee name...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 180px;">
            <mat-label>Date</mat-label>
            <input matInput [matDatepicker]="datePicker" [formControl]="dateFilter" placeholder="Select date">
            <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
            <mat-datepicker #datePicker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 160px;">
            <mat-label>Work Mode</mat-label>
            <mat-select [formControl]="workModeFilter">
              <mat-option value="">All Modes</mat-option>
              @for (mode of workModes; track mode) {
                <mat-option [value]="mode">{{ mode }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          @if (isAdmin) {
            <button mat-stroked-button (click)="resetFilters()" style="height: 56px;">
              <mat-icon>refresh</mat-icon>
              Reset
            </button>
          }
        </div>

        @if (loading) {
          <div style="display: flex; justify-content: center; padding: 48px;">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <table mat-table [dataSource]="dataSource" matSort class="attendance-table">
            <ng-container matColumnDef="empId">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Employee ID </th>
              <td mat-cell *matCellDef="let row"> {{ row.empId }} </td>
            </ng-container>

            <ng-container matColumnDef="employeeName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Employee Name </th>
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
                @if (row.checkOut) {
                  <mat-chip class="checkout-chip">{{ row.checkOut | date:'shortTime' }}</mat-chip>
                } @else {
                  <mat-chip class="inprogress-chip">In Progress</mat-chip>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="totalHours">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Total Hours </th>
              <td mat-cell *matCellDef="let row">
                @if (row.totalHours != null) {
                  <span [class.text-accent-600]="row.totalHours >= 8" [class.text-amber-600]="row.totalHours > 0 && row.totalHours < 8">
                    {{ row.totalHours | number:'1.1-1' }}h
                  </span>
                } @else {
                  <span class="text-surface-400">--</span>
                }
              </td>
            </ng-container>

            <ng-container matColumnDef="workMode">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Work Mode </th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [class.wfo-chip]="row.workMode === 'WFO'" [class.wfh-chip]="row.workMode === 'WFH'" [class.hybrid-chip]="row.workMode === 'Hybrid'">
                  {{ row.workMode }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
              <td mat-cell *matCellDef="let row">
                @if (row.checkOut) {
                  <mat-chip class="completed-chip">Completed</mat-chip>
                } @else {
                  <mat-chip class="pending-chip">Active</mat-chip>
                }
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            @if (dataSource.filteredData.length === 0) {
              <tr class="mat-row">
                <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align: center; padding: 48px; color: #94a3b8;">
                  <mat-icon style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px;">fact_check</mat-icon>
                  <div>No attendance records found</div>
                </td>
              </tr>
            }
          </table>

          <mat-paginator [pageSizeOptions]="[5, 10, 25, 50]" showFirstLastButtons aria-label="Select page"></mat-paginator>
        }
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
  `]
})
export class AttendanceListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['empId', 'employeeName', 'attendanceDate', 'checkIn', 'checkOut', 'totalHours', 'workMode', 'status'];
  dataSource = new MatTableDataSource<Attendance>([]);
  loading = true;
  isAdmin = false;
  workModes = WORK_MODES;

  searchControl = new FormControl<string>('');
  dateFilter = new FormControl<Date | null>(null);
  workModeFilter = new FormControl<string>('');

  private destroy$ = new Subject<void>();
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    const role = this.authService.userRole;
    this.isAdmin = role === 'Admin' || role === 'Manager';
    this.loadAttendance();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private loadAttendance(): void {
    this.loading = true;
    const employeeId = this.authService.currentUserValue?.userId || 0;

    const obs = this.isAdmin
      ? this.attendanceService.getAll()
      : this.attendanceService.getByEmployee(employeeId);

    obs.subscribe({
      next: (records) => {
        this.dataSource.data = records;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load attendance records', 'Close', { duration: 3000 });
      }
    });
  }

  private setupFilters(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());

    this.dateFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.applyFilters());
    this.workModeFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.applyFilters());
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private applyFilters(): void {
    const search = (this.searchControl.value || '').trim().toLowerCase();
    const dt: Date | null = this.dateFilter.value;
    const mode = this.workModeFilter.value;

    const selectedDateStr = dt ? this.formatDate(dt) : null;

    this.dataSource.filterPredicate = (data: Attendance, filter: string) => {
      const filters = filter ? JSON.parse(filter) : {};
      const q = (filters.search || '').toLowerCase();
      const d = filters.date || null;
      const m = filters.mode || '';

      let matchesSearch = true;
      if (q) {
        matchesSearch =
          data.firstName.toLowerCase().includes(q) ||
          data.lastName.toLowerCase().includes(q) ||
          data.employeeName.toLowerCase().includes(q) ||
          data.empId.toString().includes(q);
      }

      let matchesDate = true;
      if (d) {
        matchesDate = data.attendanceDate === d;
      }

      let matchesMode = true;
      if (m) {
        matchesMode = data.workMode === m;
      }

      return matchesSearch && matchesDate && matchesMode;
    };

    this.dataSource.filter = JSON.stringify({
      search,
      date: selectedDateStr,
      mode,
    });
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.dateFilter.setValue(null);
    this.workModeFilter.setValue('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
