import { Component, OnInit, ViewChild, AfterViewInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
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
import { ProjectService } from '../../services/project.service';
import { Project, ProjectAllocation } from '../../models';

@Component({
  selector: 'app-project-list',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
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
          <h1 class="page-title">Projects</h1>
          <p class="page-subtitle">Manage your organization's projects and allocations</p>
        </div>
        <div class="flex gap-2">
          <button mat-raised-button color="accent" routerLink="/projects/allocation">
            <mat-icon>group_add</mat-icon>
            Allocate
          </button>
          <button mat-raised-button color="primary" routerLink="/projects/add">
            <mat-icon>add</mat-icon>
            Add Project
          </button>
        </div>
      </div>

      <div class="mat-elevation-z2" style="background: white; border-radius: 12px; overflow: hidden;">
        <div style="padding: 16px 24px 0; display: flex; gap: 16px; flex-wrap: wrap;">
          <mat-form-field appearance="outline" style="flex: 1; min-width: 280px;">
            <mat-label>Search</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Search by project name...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 180px;">
            <mat-label>Status</mat-label>
            <mat-select [formControl]="statusFilter">
              <mat-option value="">All Status</mat-option>
              <mat-option value="Active">Active</mat-option>
              <mat-option value="Completed">Completed</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        @if (loading) {
          <div style="display: flex; justify-content: center; padding: 48px;">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <div style="position: relative; min-height: 200px;">
            <table mat-table [dataSource]="dataSource" matSort class="project-table">
              <ng-container matColumnDef="projectId">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> ID </th>
                <td mat-cell *matCellDef="let project"> {{ project.projectId }} </td>
              </ng-container>

              <ng-container matColumnDef="projectName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Project Name </th>
                <td mat-cell *matCellDef="let project">
                  <div style="font-weight: 500; color: #1e293b;">{{ project.projectName }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="clientName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Client </th>
                <td mat-cell *matCellDef="let project"> {{ project.clientName || 'N/A' }} </td>
              </ng-container>

              <ng-container matColumnDef="startDate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Start Date </th>
                <td mat-cell *matCellDef="let project"> {{ project.startDate | date:'mediumDate' }} </td>
              </ng-container>

              <ng-container matColumnDef="endDate">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> End Date </th>
                <td mat-cell *matCellDef="let project"> {{ project.endDate ? (project.endDate | date:'mediumDate') : '-' }} </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
                <td mat-cell *matCellDef="let project">
                  <mat-chip [class.active-chip]="project.status === 'Active'" [class.completed-chip]="project.status === 'Completed'">
                    {{ project.status }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="assignedEmployees">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Assigned </th>
                <td mat-cell *matCellDef="let project">
                  <span class="assigned-count">{{ getAllocationCount(project.projectId) }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef style="text-align: right;"> Actions </th>
                <td mat-cell *matCellDef="let project" style="text-align: right;">
                  <button mat-icon-button matTooltip="View Details" (click)="viewDetails(project)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Edit Project" (click)="editProject(project)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Delete Project" (click)="deleteProject(project)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              @if (dataSource.filteredData.length === 0) {
                <tr class="mat-row">
                  <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align: center; padding: 48px; color: #94a3b8;">
                    <mat-icon style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px;">folder_open</mat-icon>
                    <div>No projects found</div>
                  </td>
                </tr>
              }
            </table>
          </div>

          <mat-paginator [pageSizeOptions]="[5, 10, 25, 50]" showFirstLastButtons aria-label="Select page of projects"></mat-paginator>
        }
      </div>
    </div>
  `,
  styles: [`
    .project-table { width: 100%; }
    .project-table .mat-mdc-header-cell { font-weight: 600; color: #64748b; background: #f8fafc; }
    .project-table .mat-mdc-cell { color: #475569; }
    .project-table .mat-mdc-row:hover { background: #f1f5f9; }
    .active-chip { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .completed-chip { --mat-chip-selected-row-color: #f0f9ff !important; color: #075985 !important; }
    .assigned-count {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 50%;
      background: #eef2ff; color: #4f46e5;
      font-weight: 600; font-size: 14px;
    }
  `]
})
export class ProjectListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['projectId', 'projectName', 'clientName', 'startDate', 'endDate', 'status', 'assignedEmployees', 'actions'];
  dataSource = new MatTableDataSource<Project>([]);
  allocations: ProjectAllocation[] = [];
  loading = true;

  searchControl = new FormControl('');
  statusFilter = new FormControl('');

  private destroy$ = new Subject<void>();
  private projectService = inject(ProjectService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadProjects();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private loadProjects(): void {
    this.loading = true;
    this.projectService.getAll().subscribe({
      next: (projects) => {
        this.dataSource.data = projects;
        this.projectService.getAllocations().subscribe(allocs => {
          this.allocations = allocs;
          this.loading = false;
        });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load projects', 'Close', { duration: 3000 });
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

    this.statusFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyFilters();
    });
  }

  private applyFilters(): void {
    const search = (this.searchControl.value || '').trim().toLowerCase();
    const status = this.statusFilter.value;

    this.dataSource.filterPredicate = (data: Project, filter: string) => {
      const matchesSearch = !filter ||
        data.projectName.toLowerCase().includes(filter) ||
        (data.clientName || '').toLowerCase().includes(filter);

      const matchesStatus = !status || data.status === status;

      return matchesSearch && matchesStatus;
    };

    this.dataSource.filter = search;
  }

  getAllocationCount(projectId: number): number {
    return this.allocations.filter(a => a.projectId === projectId && a.status).length;
  }

  viewDetails(project: Project): void {
    import('../project-details/project-details.component').then(m => {
      this.dialog.open(m.ProjectDetailsComponent, {
        width: '650px',
        data: { project, allocations: this.allocations.filter(a => a.projectId === project.projectId) },
      });
    });
  }

  editProject(project: Project): void {
    this.router.navigate(['/projects/edit', project.projectId]);
  }

  deleteProject(project: Project): void {
    const confirmDelete = confirm(`Are you sure you want to delete "${project.projectName}"?`);
    if (confirmDelete) {
      this.projectService.delete(project.projectId).subscribe({
        next: () => {
          this.snackBar.open('Project deleted successfully', 'Close', { duration: 3000 });
          this.loadProjects();
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Failed to delete project', 'Close', { duration: 3000 });
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
