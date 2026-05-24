import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { AnnouncementService } from '../../services/announcement.service';
import { Announcement } from '../../models';

@Component({
  selector: 'app-announcement-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center gap-3 mb-6">
        <button mat-icon-button routerLink="/announcements">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <div>
          <h1 class="page-title mb-0">Announcement Details</h1>
          <p class="page-subtitle mt-1">View full announcement information</p>
        </div>
      </div>

      @if (loading) {
        <div style="display: flex; justify-content: center; padding: 48px;">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else if (announcement) {
        <div class="detail-card">
          <div class="detail-header">
            <div class="header-left">
              <h2>{{ announcement.title }}</h2>
              <div class="meta">
                <mat-chip [class.active-chip]="announcement.isActive" [class.inactive-chip]="!announcement.isActive">
                  {{ announcement.isActive ? 'Active' : 'Inactive' }}
                </mat-chip>
              </div>
            </div>
            <div class="header-actions">
              <button mat-stroked-button [routerLink]="['/announcements/edit', announcement.announcementId]">
                <mat-icon>edit</mat-icon>
                Edit
              </button>
            </div>
          </div>

          <mat-divider class="detail-divider"></mat-divider>

          <div class="detail-body">
            <div class="message-content">{{ announcement.message }}</div>
          </div>

          <mat-divider class="detail-divider"></mat-divider>

          <div class="detail-footer">
            <div class="footer-item">
              <span class="footer-label">Created By</span>
              <span class="footer-value">{{ announcement.createdByName || 'System' }}</span>
            </div>
            <div class="footer-item">
              <span class="footer-label">Created On</span>
              <span class="footer-value">{{ announcement.createdOn | date:'longDate' }}</span>
            </div>
            @if (announcement.updatedOn) {
              <div class="footer-item">
                <span class="footer-label">Last Updated</span>
                <span class="footer-value">{{ announcement.updatedOn | date:'longDate' }}</span>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-card { background: white; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); max-width: 800px; }
    .detail-header { display: flex; justify-content: space-between; align-items: flex-start; padding: 24px 28px; }
    .header-left h2 { font-size: 20px; font-weight: 600; color: #1e293b; margin: 0 0 8px; }
    .meta { display: flex; gap: 8px; align-items: center; }
    .active-chip { --mat-chip-selected-row-color: #dcfce7 !important; color: #166534 !important; }
    .inactive-chip { --mat-chip-selected-row-color: #fef2f2 !important; color: #991b1b !important; }
    .detail-divider { margin: 0 28px; }
    .detail-body { padding: 28px; }
    .message-content { font-size: 15px; line-height: 1.7; color: #475569; white-space: pre-wrap; }
    .detail-footer { display: flex; gap: 40px; padding: 20px 28px; }
    .footer-item { display: flex; flex-direction: column; gap: 4px; }
    .footer-label { font-size: 12px; font-weight: 500; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }
    .footer-value { font-size: 14px; color: #1e293b; font-weight: 500; }
  `]
})
export class AnnouncementDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private announcementService = inject(AnnouncementService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  announcement: Announcement | null = null;
  loading = true;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/announcements']);
      return;
    }
    this.announcementService.getById(Number(id)).subscribe({
      next: (item) => {
        this.announcement = item;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load announcement', 'Close', { duration: 3000 });
        this.router.navigate(['/announcements']);
      }
    });
  }
}
