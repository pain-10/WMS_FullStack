import { Component, OnInit, ViewChild, AfterViewInit, inject, OnDestroy } from '@angular/core';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { EmployeeService } from '../services/employee.service';
import { DepartmentService } from '../../services/department.service';
import { Employee, Department } from '../models/employee.model';

@Component({
  selector: 'app-employee-list',
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
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="page-header flex items-center justify-between">
        <div>
          <h1 class="page-title">Employees</h1>
          <p class="page-subtitle">Manage your organization's employees</p>
        </div>
        <button mat-raised-button color="primary" (click)="openAddEmployee()">
          <mat-icon>add</mat-icon>
          Add Employee
        </button>
      </div>

      <div class="mat-elevation-z2" style="background: white; border-radius: 12px; overflow: hidden;">
        <div style="padding: 16px 24px 0; display: flex; gap: 16px; flex-wrap: wrap;">
          <mat-form-field appearance="outline" style="flex: 1; min-width: 280px;">
            <mat-label>Search</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Search by name, email, department...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 200px;">
            <mat-label>Department</mat-label>
            <mat-select [formControl]="departmentFilter">
              <mat-option value="">All Departments</mat-option>
              @for (dept of departments; track dept.departmentId) {
                <mat-option [value]="dept.departmentId">{{ dept.departmentName }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 160px;">
            <mat-label>Status</mat-label>
            <mat-select [formControl]="statusFilter">
              <mat-option value="">All Status</mat-option>
              <mat-option value="Active">Active</mat-option>
              <mat-option value="Inactive">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        @if (loading) {
          <div style="display: flex; justify-content: center; padding: 48px;">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <div style="position: relative; min-height: 200px;">
            <table mat-table [dataSource]="dataSource" matSort class="employee-table">
              <ng-container matColumnDef="employeeId">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> ID </th>
                <td mat-cell *matCellDef="let emp"> {{ emp.employeeId }} </td>
              </ng-container>

              <ng-container matColumnDef="fullName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Full Name </th>
                <td mat-cell *matCellDef="let emp">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div class="avatar-circle">{{ emp.firstName[0] }}{{ emp.lastName[0] }}</div>
                    <div>
                      <div style="font-weight: 500; color: #1e293b;">{{ emp.firstName }} {{ emp.lastName }}</div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Email </th>
                <td mat-cell *matCellDef="let emp"> {{ emp.email }} </td>
              </ng-container>

              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Department </th>
                <td mat-cell *matCellDef="let emp">
                  <mat-chip>{{ emp.departmentName }}</mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Role </th>
                <td mat-cell *matCellDef="let emp"> {{ emp.roleName }} </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
                <td mat-cell *matCellDef="let emp">
                  <mat-chip [class.active-chip]="emp.status === 'Active'" [class.inactive-chip]="emp.status !== 'Active'">
                    {{ emp.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef style="text-align: right;"> Actions </th>
                <td mat-cell *matCellDef="let emp" style="text-align: right;">
                  <button mat-icon-button matTooltip="View Details" (click)="viewDetails(emp)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Edit Employee" (click)="editEmployee(emp)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Delete Employee" (click)="deleteEmployee(emp)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              @if (dataSource.filteredData.length === 0) {
                <tr class="mat-row">
                  <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align: center; padding: 48px; color: #94a3b8;">
                    <mat-icon style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px;">people_outline</mat-icon>
                    <div>No employees found</div>
                  </td>
                </tr>
              }
            </table>
          </div>

          <mat-paginator [pageSizeOptions]="[5, 10, 25, 50]" showFirstLastButtons aria-label="Select page of employees"></mat-paginator>
        }
      </div>
    </div>
  `,
  styles: [`
    .employee-table { width: 100%; }
    .employee-table .mat-mdc-header-cell { font-weight: 600; color: #64748b; background: #f8fafc; }
    .employee-table .mat-mdc-cell { color: #475569; }
    .employee-table .mat-mdc-row:hover { background: #f1f5f9; }
    .avatar-circle {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      display: flex; align-items: center; justify-content: center;
      color: white; font-size: 13px; font-weight: 600; flex-shrink: 0;
    }
    .active-chip { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .inactive-chip { --mat-chip-selected-row-color: #fef2f2 !important; color: #991b1b !important; }
  `]
})
export class EmployeeListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['employeeId', 'fullName', 'email', 'department', 'role', 'status', 'actions'];
  dataSource = new MatTableDataSource<Employee>([]);
  departments: Department[] = [];
  loading = true;

  searchControl = new FormControl('');
  departmentFilter = new FormControl('');
  statusFilter = new FormControl('');

  private destroy$ = new Subject<void>();
  private employeeService = inject(EmployeeService);
  private departmentService = inject(DepartmentService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.loadDepartments();
    this.loadEmployees();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private loadDepartments(): void {
    this.departmentService.getAll().subscribe(depts => {
      this.departments = depts;
    });
  }

  private loadEmployees(): void {
    this.loading = true;
    this.employeeService.getAll().subscribe({
      next: (employees) => {
        this.dataSource.data = employees;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load employees', 'Close', { duration: 3000 });
      }
    });
  }

  private setupFilters(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => {
      this.dataSource.filter = (value || '').trim().toLowerCase();
    });

    this.departmentFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyFilters();
    });

    this.statusFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    const search = (this.searchControl.value || '').trim().toLowerCase();
    const deptId = this.departmentFilter.value;
    const status = this.statusFilter.value;

    this.dataSource.filterPredicate = (data: Employee, filter: string) => {
      const matchesSearch = !filter ||
        data.firstName.toLowerCase().includes(filter) ||
        data.lastName.toLowerCase().includes(filter) ||
        data.email.toLowerCase().includes(filter) ||
        data.employeeId.toString().includes(filter) ||
        (data.departmentName || '').toLowerCase().includes(filter) ||
        (data.roleName || '').toLowerCase().includes(filter);

      const matchesDept = !deptId || data.departmentId.toString() === deptId;
      const matchesStatus = !status || data.status === status;

      return matchesSearch && matchesDept && matchesStatus;
    };

    this.dataSource.filter = search;
  }

  openAddEmployee(): void {
    import('../employee-form/employee-form.component').then(m => {
      const dialogRef = this.dialog.open(m.EmployeeFormComponent, {
        width: '700px',
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) this.loadEmployees();
      });
    });
  }

  editEmployee(emp: Employee): void {
    import('../employee-form/employee-form.component').then(m => {
      const dialogRef = this.dialog.open(m.EmployeeFormComponent, {
        width: '700px',
        data: { employee: emp },
        disableClose: true,
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result) this.loadEmployees();
      });
    });
  }

  viewDetails(emp: Employee): void {
    import('../employee-details/employee-details.component').then(m => {
      this.dialog.open(m.EmployeeDetailsComponent, {
        width: '600px',
        data: { employee: emp },
      });
    });
  }

  deleteEmployee(emp: Employee): void {
    const confirmDelete = confirm(`Are you sure you want to delete ${emp.firstName} ${emp.lastName}?`);
    if (confirmDelete) {
      this.employeeService.delete(emp.employeeId).subscribe({
        next: () => {
          this.snackBar.open('Employee deleted successfully', 'Close', { duration: 3000 });
          this.loadEmployees();
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Failed to delete employee', 'Close', { duration: 3000 });
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
