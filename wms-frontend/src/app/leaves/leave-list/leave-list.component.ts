import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { LeaveService } from '../services/leave.service';
import { AuthService } from '../../services/auth.service';
import { Leave, LEAVE_TYPES, LEAVE_STATUSES } from '../models/leave.model';

@Component({
  selector: 'app-leave-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
    MatSnackBarModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="page-header flex items-center justify-between">
        <div>
          <h1 class="page-title">Leave Management</h1>
          <p class="page-subtitle">{{ isAdmin ? 'Approve, reject, and manage leave requests' : 'View and manage your leave requests' }}</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/leave/apply">
          <mat-icon>add</mat-icon>
          Apply Leave
        </button>
      </div>

      <div class="grid gap-4 md:grid-cols-3 mb-6">
        <mat-card>
          <mat-card-content class="p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <mat-icon class="text-amber-600">pending</mat-icon>
            </div>
            <div>
              <p class="text-xs text-surface-500">Pending</p>
              <p class="text-xl font-bold text-amber-600">{{ pendingCount }}</p>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content class="p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center flex-shrink-0">
              <mat-icon class="text-accent-600">check_circle</mat-icon>
            </div>
            <div>
              <p class="text-xs text-surface-500">Approved</p>
              <p class="text-xl font-bold text-accent-600">{{ approvedCount }}</p>
            </div>
          </mat-card-content>
        </mat-card>
        <mat-card>
          <mat-card-content class="p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <mat-icon class="text-red-600">cancel</mat-icon>
            </div>
            <div>
              <p class="text-xs text-surface-500">Rejected</p>
              <p class="text-xl font-bold text-red-600">{{ rejectedCount }}</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="mat-elevation-z2" style="background: white; border-radius: 12px; overflow: hidden;">
        <div style="padding: 16px 24px 0; display: flex; gap: 16px; flex-wrap: wrap;">
          <mat-form-field appearance="outline" style="flex: 1; min-width: 200px;">
            <mat-label>Search</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Search by name...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 160px;">
            <mat-label>Leave Type</mat-label>
            <mat-select [formControl]="typeFilter">
              <mat-option value="">All Types</mat-option>
              @for (t of leaveTypes; track t) {
                <mat-option [value]="t">{{ t }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 160px;">
            <mat-label>Status</mat-label>
            <mat-select [formControl]="statusFilter">
              <mat-option value="">All Status</mat-option>
              @for (s of leaveStatuses; track s) {
                <mat-option [value]="s">{{ s }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 180px;">
            <mat-label>Date</mat-label>
            <input matInput [matDatepicker]="datePicker" [formControl]="dateFilter" placeholder="From date">
            <mat-datepicker-toggle matSuffix [for]="datePicker"></mat-datepicker-toggle>
            <mat-datepicker #datePicker></mat-datepicker>
          </mat-form-field>

          <button mat-stroked-button (click)="resetFilters()" style="height: 56px;">
            <mat-icon>refresh</mat-icon> Reset
          </button>
        </div>

        @if (loading) {
          <div style="display: flex; justify-content: center; padding: 48px;">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <table mat-table [dataSource]="dataSource" matSort class="leave-table">
            <ng-container matColumnDef="leaveId">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Leave ID </th>
              <td mat-cell *matCellDef="let row"> {{ row.leaveId }} </td>
            </ng-container>

            <ng-container matColumnDef="employeeName">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Employee </th>
              <td mat-cell *matCellDef="let row">
                <span class="font-medium text-surface-900">{{ row.employeeName || 'N/A' }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="leaveType">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Leave Type </th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [class.sick-chip]="row.leaveType === 'Sick'" [class.casual-chip]="row.leaveType === 'Casual'" [class.earned-chip]="row.leaveType === 'Earned'">
                  {{ row.leaveType }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="fromDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> From </th>
              <td mat-cell *matCellDef="let row"> {{ row.fromDate | date:'mediumDate' }} </td>
            </ng-container>

            <ng-container matColumnDef="toDate">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> To </th>
              <td mat-cell *matCellDef="let row"> {{ row.toDate | date:'mediumDate' }} </td>
            </ng-container>

            <ng-container matColumnDef="reason">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Reason </th>
              <td mat-cell *matCellDef="let row" matTooltip="{{ row.reason }}" [style.max-width]="'180px'" class="truncate-text">
                {{ row.reason || '-' }}
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [class.approved-chip]="row.status === 'Approved'" [class.pending-chip]="row.status === 'Pending'" [class.rejected-chip]="row.status === 'Rejected'" [class.cancelled-chip]="row.status === 'Cancelled'">
                  {{ row.status }}
                </mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="appliedOn">
              <th mat-header-cell *matHeaderCellDef mat-sort-header> Applied On </th>
              <td mat-cell *matCellDef="let row"> {{ row.appliedOn | date:'mediumDate' }} </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef style="text-align: right;"> Actions </th>
              <td mat-cell *matCellDef="let row" style="text-align: right;">
                @if (row.status === 'Pending') {
                  @if (isAdmin) {
                    <button mat-icon-button color="primary" matTooltip="Approve" (click)="approveLeave(row)">
                      <mat-icon>check_circle</mat-icon>
                    </button>
                    <button mat-icon-button color="warn" matTooltip="Reject" (click)="rejectLeave(row)">
                      <mat-icon>cancel</mat-icon>
                    </button>
                  }
                  <button mat-icon-button matTooltip="Cancel" (click)="cancelLeave(row)">
                    <mat-icon>delete</mat-icon>
                  </button>
                }
                <button mat-icon-button matTooltip="View Details" (click)="viewDetails(row)">
                  <mat-icon>visibility</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

            @if (dataSource.filteredData.length === 0) {
              <tr class="mat-row">
                <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align: center; padding: 48px; color: #94a3b8;">
                  <mat-icon style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px;">event_busy</mat-icon>
                  <div>No leave records found</div>
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
    .leave-table { width: 100%; }
    .leave-table .mat-mdc-header-cell { font-weight: 600; color: #64748b; background: #f8fafc; }
    .leave-table .mat-mdc-cell { color: #475569; }
    .leave-table .mat-mdc-row:hover { background: #f1f5f9; }
    .truncate-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sick-chip { --mat-chip-selected-row-color: #fef2f2 !important; color: #991b1b !important; }
    .casual-chip { --mat-chip-selected-row-color: #dbeafe !important; color: #1e40af !important; }
    .earned-chip { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .approved-chip { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .pending-chip { --mat-chip-selected-row-color: #fef3c7 !important; color: #92400e !important; }
    .rejected-chip { --mat-chip-selected-row-color: #fef2f2 !important; color: #991b1b !important; }
    .cancelled-chip { --mat-chip-selected-row-color: #f1f5f9 !important; color: #64748b !important; }
  `]
})
export class LeaveListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['leaveId', 'employeeName', 'leaveType', 'fromDate', 'toDate', 'reason', 'status', 'appliedOn', 'actions'];
  dataSource = new MatTableDataSource<Leave>([]);
  loading = true;
  isAdmin = false;
  leaveTypes = LEAVE_TYPES;
  leaveStatuses = LEAVE_STATUSES;

  searchControl = new FormControl<string>('');
  typeFilter = new FormControl<string>('');
  statusFilter = new FormControl<string>('');
  dateFilter = new FormControl<Date | null>(null);

  private destroy$ = new Subject<void>();
  private leaveService = inject(LeaveService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  get pendingCount(): number { return this.dataSource.data.filter(l => l.status === 'Pending').length; }
  get approvedCount(): number { return this.dataSource.data.filter(l => l.status === 'Approved').length; }
  get rejectedCount(): number { return this.dataSource.data.filter(l => l.status === 'Rejected').length; }

  ngOnInit(): void {
    const role = this.authService.userRole;
    this.isAdmin = role === 'Admin' || role === 'Manager';
    this.loadLeaves();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private loadLeaves(): void {
    this.loading = true;
    const employeeId = this.authService.currentUserValue?.userId || 0;

    const obs = this.isAdmin
      ? this.leaveService.getAll()
      : this.leaveService.getByEmployee(employeeId);

    obs.subscribe({
      next: (leaves) => {
        this.dataSource.data = leaves;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load leave records', 'Close', { duration: 3000 });
      }
    });
  }

  private setupFilters(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());

    this.typeFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.applyFilters());
    this.statusFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.applyFilters());
    this.dateFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.applyFilters());
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private applyFilters(): void {
    const search = (this.searchControl.value || '').trim().toLowerCase();
    const type = this.typeFilter.value;
    const status = this.statusFilter.value;
    const dt: Date | null = this.dateFilter.value;

    const selectedDateStr = dt ? this.formatDate(dt) : null;

    this.dataSource.filterPredicate = (data: Leave) => {
      let matchesSearch = true;
      if (search) {
        matchesSearch =
          (data.employeeName || '').toLowerCase().includes(search) ||
          (data.firstName || '').toLowerCase().includes(search) ||
          (data.lastName || '').toLowerCase().includes(search);
      }

      let matchesType = true;
      if (type) {
        matchesType = data.leaveType === type;
      }

      let matchesStatus = true;
      if (status) {
        matchesStatus = data.status === status;
      }

      let matchesDate = true;
      if (selectedDateStr) {
        matchesDate = data.fromDate === selectedDateStr || data.toDate === selectedDateStr;
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    };

    this.dataSource.filter = JSON.stringify({ search, type, status, date: selectedDateStr });
  }

  resetFilters(): void {
    this.searchControl.setValue('');
    this.typeFilter.setValue('');
    this.statusFilter.setValue('');
    this.dateFilter.setValue(null);
  }

  approveLeave(leave: Leave): void {
    const userId = this.authService.currentUserValue?.userId || 0;
    this.leaveService.approve(leave.leaveId, userId).subscribe({
      next: () => {
        this.snackBar.open('Leave approved successfully', 'Close', { duration: 3000 });
        this.loadLeaves();
      },
      error: () => this.snackBar.open('Failed to approve leave', 'Close', { duration: 3000 })
    });
  }

  rejectLeave(leave: Leave): void {
    const userId = this.authService.currentUserValue?.userId || 0;
    this.leaveService.reject(leave.leaveId, userId).subscribe({
      next: () => {
        this.snackBar.open('Leave rejected', 'Close', { duration: 3000 });
        this.loadLeaves();
      },
      error: () => this.snackBar.open('Failed to reject leave', 'Close', { duration: 3000 })
    });
  }

  cancelLeave(leave: Leave): void {
    if (!confirm(`Cancel ${leave.leaveType} leave?`)) return;
    this.leaveService.cancel(leave.leaveId).subscribe({
      next: () => {
        this.snackBar.open('Leave cancelled', 'Close', { duration: 3000 });
        this.loadLeaves();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to cancel leave', 'Close', { duration: 3000 });
      }
    });
  }

  viewDetails(leave: Leave): void {
    import('../leave-details/leave-details.component').then(m => {
      this.dialog.open(m.LeaveDetailsComponent, {
        width: '550px',
        data: { leave },
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
