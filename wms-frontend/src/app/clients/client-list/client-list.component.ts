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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { ClientService } from '../../services/client.service';
import { ProjectService } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { Client, Project } from '../../models';

@Component({
  selector: 'app-client-list',
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
    MatSnackBarModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="page-header flex items-center justify-between">
        <div>
          <h1 class="page-title">Clients</h1>
          <p class="page-subtitle">Manage your organization's clients and accounts</p>
        </div>
        @if (canManage) {
          <button mat-raised-button color="primary" routerLink="/clients/add">
            <mat-icon>add</mat-icon>
            Add Client
          </button>
        }
      </div>

      <div class="mat-elevation-z2" style="background: white; border-radius: 12px; overflow: hidden;">
        <div style="padding: 16px 24px 0; display: flex; gap: 16px; flex-wrap: wrap;">
          <mat-form-field appearance="outline" style="flex: 1; min-width: 280px;">
            <mat-label>Search</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Search by client name...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 180px;">
            <mat-label>Status</mat-label>
            <mat-select [formControl]="statusFilter">
          <mat-option value="">All Status</mat-option>
          <mat-option value="true">Active</mat-option>
          <mat-option value="false">Inactive</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        @if (loading) {
          <div style="display: flex; justify-content: center; padding: 48px;">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <div style="position: relative; min-height: 200px;">
            <table mat-table [dataSource]="dataSource" matSort class="client-table">
              <ng-container matColumnDef="clientId">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> ID </th>
                <td mat-cell *matCellDef="let client"> {{ client.clientId }} </td>
              </ng-container>

              <ng-container matColumnDef="clientName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Client Name </th>
                <td mat-cell *matCellDef="let client">
                  <div style="font-weight: 500; color: #1e293b;">{{ client.clientName }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="clientAddress">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Address </th>
                <td mat-cell *matCellDef="let client"> {{ client.clientAddress || '-' }} </td>
              </ng-container>

              <ng-container matColumnDef="clientPhoneNumber">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Phone </th>
                <td mat-cell *matCellDef="let client"> {{ client.clientPhoneNumber || '-' }} </td>
              </ng-container>

              <ng-container matColumnDef="clientLocation">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Location </th>
                <td mat-cell *matCellDef="let client"> {{ client.clientLocation || '-' }} </td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
                <td mat-cell *matCellDef="let client">
                  <mat-chip [class.active-chip]="client.status" [class.inactive-chip]="!client.status">
                    {{ client.status ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="projectCount">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Projects </th>
                <td mat-cell *matCellDef="let client">
                  <span class="project-count">{{ getProjectCount(client.clientId) }}</span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef style="text-align: right;"> Actions </th>
                <td mat-cell *matCellDef="let client" style="text-align: right;">
                  <button mat-icon-button matTooltip="View Details" (click)="viewDetails(client)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  @if (canManage) {
                    <button mat-icon-button matTooltip="Edit Client" (click)="editClient(client)">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button matTooltip="Delete Client" (click)="deleteClient(client)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  }
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              @if (dataSource.filteredData.length === 0) {
                <tr class="mat-row">
                  <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align: center; padding: 48px; color: #94a3b8;">
                    <mat-icon style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px;">business</mat-icon>
                    <div>No clients found</div>
                  </td>
                </tr>
              }
            </table>
          </div>

          <mat-paginator [pageSizeOptions]="[5, 10, 25, 50]" showFirstLastButtons aria-label="Select page of clients"></mat-paginator>
        }
      </div>
    </div>
  `,
  styles: [`
    .client-table { width: 100%; }
    .client-table .mat-mdc-header-cell { font-weight: 600; color: #64748b; background: #f8fafc; }
    .client-table .mat-mdc-cell { color: #475569; }
    .client-table .mat-mdc-row:hover { background: #f1f5f9; }
    .active-chip { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .inactive-chip { --mat-chip-selected-row-color: #fef2f2 !important; color: #991b1b !important; }
    .project-count {
      display: inline-flex; align-items: center; justify-content: center;
      width: 32px; height: 32px; border-radius: 50%;
      background: #eef2ff; color: #4f46e5;
      font-weight: 600; font-size: 14px;
    }
  `]
})
export class ClientListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['clientId', 'clientName', 'clientAddress', 'clientPhoneNumber', 'clientLocation', 'status', 'projectCount', 'actions'];
  dataSource = new MatTableDataSource<Client>([]);
  projects: Project[] = [];
  loading = true;
  canManage = false;

  searchControl = new FormControl('');
  statusFilter = new FormControl('');

  private destroy$ = new Subject<void>();
  private clientService = inject(ClientService);
  private projectService = inject(ProjectService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  ngOnInit(): void {
    this.canManage = this.authService.userRole !== 'Employee';
    this.loadData();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private loadData(): void {
    this.loading = true;
    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.dataSource.data = clients;
        this.projectService.getAll().subscribe(projects => {
          this.projects = projects;
          this.loading = false;
        });
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load clients', 'Close', { duration: 3000 });
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

    this.dataSource.filterPredicate = (data: Client, filter: string) => {
      const matchesSearch = !filter ||
        data.clientName.toLowerCase().includes(filter);

      const matchesStatus = status === '' || data.status === (status === 'true');

      return matchesSearch && matchesStatus;
    };

    this.dataSource.filter = search;
  }

  getProjectCount(clientId: number): number {
    return this.projects.filter(p => p.clientId === clientId).length;
  }

  viewDetails(client: Client): void {
    this.router.navigate(['/clients', client.clientId]);
  }

  editClient(client: Client): void {
    this.router.navigate(['/clients/edit', client.clientId]);
  }

  deleteClient(client: Client): void {
    const confirmDelete = confirm(`Are you sure you want to delete "${client.clientName}"?`);
    if (confirmDelete) {
      this.clientService.delete(client.clientId).subscribe({
        next: () => {
          this.snackBar.open('Client deleted successfully', 'Close', { duration: 3000 });
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          this.snackBar.open('Failed to delete client', 'Close', { duration: 3000 });
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
