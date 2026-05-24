import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
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
import { AnnouncementService } from '../../services/announcement.service';
import { AuthService } from '../../services/auth.service';
import { Announcement } from '../../models';

@Component({
  selector: 'app-announcement-list',
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
    MatTooltipModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="page-header flex items-center justify-between">
        <div>
          <h1 class="page-title">Announcements</h1>
          <p class="page-subtitle">Publish and manage internal announcements</p>
        </div>
        <button mat-raised-button color="primary" routerLink="/announcements/add">
          <mat-icon>add</mat-icon>
          Add Announcement
        </button>
      </div>

      <div class="mat-elevation-z2" style="background: white; border-radius: 12px; overflow: hidden;">
        <div style="padding: 16px 24px 0; display: flex; gap: 16px; flex-wrap: wrap;">
          <mat-form-field appearance="outline" style="flex: 1; min-width: 280px;">
            <mat-label>Search</mat-label>
            <input matInput [formControl]="searchControl" placeholder="Search by title...">
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
            <table mat-table [dataSource]="dataSource" matSort class="announcement-table">
              <ng-container matColumnDef="announcementId">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> ID </th>
                <td mat-cell *matCellDef="let item"> {{ item.announcementId }} </td>
              </ng-container>

              <ng-container matColumnDef="title">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Title </th>
                <td mat-cell *matCellDef="let item">
                  <div class="title-cell">{{ item.title }}</div>
                </td>
              </ng-container>

              <ng-container matColumnDef="message">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Message </th>
                <td mat-cell *matCellDef="let item" class="message-cell" matTooltip="{{ item.message }}">
                  {{ item.message }}
                </td>
              </ng-container>

              <ng-container matColumnDef="createdByName">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Created By </th>
                <td mat-cell *matCellDef="let item"> {{ item.createdByName || 'System' }} </td>
              </ng-container>

              <ng-container matColumnDef="createdOn">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Created Date </th>
                <td mat-cell *matCellDef="let item"> {{ item.createdOn | date:'mediumDate' }} </td>
              </ng-container>

              <ng-container matColumnDef="isActive">
                <th mat-header-cell *matHeaderCellDef mat-sort-header> Status </th>
                <td mat-cell *matCellDef="let item">
                  <mat-chip [class.active-chip]="item.isActive" [class.inactive-chip]="!item.isActive">
                    {{ item.isActive ? 'Active' : 'Inactive' }}
                  </mat-chip>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef style="text-align: right;"> Actions </th>
                <td mat-cell *matCellDef="let item" style="text-align: right;">
                  <button mat-icon-button matTooltip="View Details" (click)="viewDetails(item)">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Edit" (click)="editAnnouncement(item)">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button matTooltip="Delete" (click)="deleteAnnouncement(item)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

              @if (dataSource.filteredData.length === 0) {
                <tr class="mat-row">
                  <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align: center; padding: 48px; color: #94a3b8;">
                    <mat-icon style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 8px;">campaign</mat-icon>
                    <div>No announcements found</div>
                  </td>
                </tr>
              }
            </table>
          </div>

          <mat-paginator [pageSizeOptions]="[5, 10, 25, 50]" showFirstLastButtons aria-label="Select page of announcements"></mat-paginator>
        }
      </div>
    </div>
  `,
  styles: [`
    .announcement-table { width: 100%; }
    .announcement-table .mat-mdc-header-cell { font-weight: 600; color: #64748b; background: #f8fafc; }
    .announcement-table .mat-mdc-cell { color: #475569; }
    .announcement-table .mat-mdc-row:hover { background: #f1f5f9; }
    .title-cell { font-weight: 500; color: #1e293b; }
    .message-cell { max-width: 240px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .active-chip { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .inactive-chip { --mat-chip-selected-row-color: #fef2f2 !important; color: #991b1b !important; }
  `]
})
export class AnnouncementListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = ['announcementId', 'title', 'message', 'createdByName', 'createdOn', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<Announcement>([]);
  loading = true;

  searchControl = new FormControl('');
  statusFilter = new FormControl('');

  private destroy$ = new Subject<void>();
  private announcementService = inject(AnnouncementService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  ngOnInit(): void {
    this.loadAnnouncements();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  private loadAnnouncements(): void {
    this.loading = true;
    this.announcementService.getAll().subscribe({
      next: (items) => {
        this.dataSource.data = items;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load announcements', 'Close', { duration: 3000 });
      }
    });
  }

  private setupFilters(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.applyFilters());

    this.statusFilter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.applyFilters());
  }

  private applyFilters(): void {
    const search = (this.searchControl.value || '').trim().toLowerCase();
    const status = this.statusFilter.value;

    this.dataSource.filterPredicate = (data: Announcement, filter: string) => {
      const matchesSearch = !filter ||
        data.title.toLowerCase().includes(filter) ||
        data.message.toLowerCase().includes(filter);

      const matchesStatus = status === '' || data.isActive === (status === 'true');

      return matchesSearch && matchesStatus;
    };

    this.dataSource.filter = search;
  }

  viewDetails(item: Announcement): void {
    this.router.navigate(['/announcements', item.announcementId]);
  }

  editAnnouncement(item: Announcement): void {
    this.router.navigate(['/announcements/edit', item.announcementId]);
  }

  deleteAnnouncement(item: Announcement): void {
    if (!confirm(`Delete "${item.title}"?`)) return;
    this.announcementService.delete(item.announcementId).subscribe({
      next: () => {
        this.snackBar.open('Announcement deleted', 'Close', { duration: 3000 });
        this.loadAnnouncements();
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to delete', 'Close', { duration: 3000 });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
