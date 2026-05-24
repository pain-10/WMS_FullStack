import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AppNotification, NOTIFICATION_ICONS, NOTIFICATION_COLORS } from '../models/notification.model';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatChipsModule, MatSnackBarModule,
  ],
  template: `
    <div class="animate-fade-in">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="page-title mb-0">Notifications</h1>
          <p class="page-subtitle mt-1">Stay updated with system activity</p>
        </div>
        <div class="flex gap-2">
          @if (notifications.length > 0) {
            <button mat-stroked-button (click)="markAllRead()">
              <mat-icon>done_all</mat-icon> Mark All Read
            </button>
            <button mat-stroked-button color="warn" (click)="clearAll()">
              <mat-icon>delete_sweep</mat-icon> Clear All
            </button>
          }
        </div>
      </div>

      @if (loading) {
        <div style="display: flex; justify-content: center; padding: 80px;">
          <mat-spinner diameter="48"></mat-spinner>
        </div>
      } @else if (notifications.length === 0) {
        <div class="empty-state">
          <mat-icon class="empty-icon">notifications_none</mat-icon>
          <h3>No notifications</h3>
          <p>You're all caught up! New notifications will appear here.</p>
        </div>
      } @else {
        <div class="notif-list">
          @for (notif of notifications; track notif.notificationId) {
            <div class="notif-card" [class.unread]="!notif.isRead">
              <div class="notif-left">
                <div class="notif-icon" [class]="NOTIFICATION_COLORS[notif.type]">
                  <mat-icon>{{ NOTIFICATION_ICONS[notif.type] }}</mat-icon>
                </div>
              </div>
              <div class="notif-body">
                <div class="notif-header">
                  <h3>{{ notif.title }}</h3>
                  <span class="notif-time">{{ notif.createdAt | date:'medium' }}</span>
                </div>
                <p class="notif-msg">{{ notif.message }}</p>
                <div class="notif-footer">
                  @if (!notif.isRead) {
                    <button mat-stroked-button size="small" (click)="markAsRead(notif)">
                      <mat-icon>check</mat-icon> Mark Read
                    </button>
                  }
                  <button mat-stroked-button size="small" color="warn" (click)="deleteNotif(notif)">
                    <mat-icon>delete</mat-icon> Delete
                  </button>
                </div>
              </div>
              @if (!notif.isRead) {
                <span class="unread-badge"></span>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 64px 20px; text-align: center; }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; color: #cbd5e1; margin-bottom: 16px; }
    .empty-state h3 { font-size: 18px; font-weight: 600; color: #1e293b; margin: 0 0 4px; }
    .empty-state p { font-size: 14px; color: #94a3b8; margin: 0; }
    .notif-list { display: flex; flex-direction: column; gap: 12px; max-width: 800px; }
    .notif-card {
      display: flex; gap: 16px; background: white; padding: 20px 24px;
      border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      position: relative; transition: box-shadow 0.2s;
    }
    .notif-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .notif-card.unread { background: #f8faff; border-left: 3px solid #6366f1; }
    .notif-left { flex-shrink: 0; }
    .notif-icon {
      width: 44px; height: 44px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .notif-icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .notif-body { flex: 1; min-width: 0; }
    .notif-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 4px; }
    .notif-header h3 { font-size: 15px; font-weight: 600; color: #1e293b; margin: 0; }
    .notif-time { font-size: 12px; color: #94a3b8; white-space: nowrap; }
    .notif-msg { font-size: 14px; color: #64748b; margin: 4px 0 12px; line-height: 1.5; }
    .notif-footer { display: flex; gap: 8px; }
    .unread-badge { width: 10px; height: 10px; border-radius: 50%; background: #6366f1; flex-shrink: 0; margin-top: 4px; }
  `]
})
export class NotificationListComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private snackBar = inject(MatSnackBar);

  notifications: AppNotification[] = [];
  loading = true;

  protected readonly NOTIFICATION_ICONS = NOTIFICATION_ICONS;
  protected readonly NOTIFICATION_COLORS = NOTIFICATION_COLORS;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.subs.push(
      this.notificationService.notifications$.subscribe(n => {
        this.notifications = n;
        this.loading = false;
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  markAsRead(notif: AppNotification): void {
    this.notificationService.markAsRead(notif.notificationId).subscribe({
      next: () => this.snackBar.open('Marked as read', 'Close', { duration: 2000 }),
    });
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => this.snackBar.open('All notifications marked as read', 'Close', { duration: 2000 }),
    });
  }

  deleteNotif(notif: AppNotification): void {
    this.notificationService.deleteNotification(notif.notificationId).subscribe({
      next: () => this.snackBar.open('Notification deleted', 'Close', { duration: 2000 }),
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to delete notification', 'Close', { duration: 2000 });
      }
    });
  }

  clearAll(): void {
    if (!confirm('Clear all notifications?')) return;
    this.notificationService.clearAll().subscribe({
      next: () => this.snackBar.open('All notifications cleared', 'Close', { duration: 2000 }),
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to clear notifications', 'Close', { duration: 2000 });
      }
    });
  }
}
