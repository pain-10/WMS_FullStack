import { Component, OnInit, OnDestroy, inject, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subscription } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AppNotification, NOTIFICATION_ICONS, NOTIFICATION_COLORS } from '../models/notification.model';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="relative" #container>
      <button class="btn-icon relative" (click)="togglePanel()" [class.active]="isOpen">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
        </svg>
        @if (unreadCount > 0) {
          <span class="notification-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        }
      </button>

      @if (isOpen) {
        <div class="panel-overlay" (click)="closePanel()"></div>
        <div class="panel-dropdown">
          <div class="panel-header">
            <h3>Notifications</h3>
            <div class="panel-actions">
              @if (notifications.length > 0) {
                <button class="text-xs text-primary-600 hover:text-primary-800 font-medium" (click)="markAllRead()">
                  Mark all read
                </button>
              }
              <button class="text-xs text-surface-400 hover:text-surface-600" routerLink="/notifications" (click)="closePanel()">
                View all
              </button>
            </div>
          </div>

          <div class="panel-body">
            @if (loading) {
              <div class="flex justify-center py-8"><mat-spinner diameter="24"></mat-spinner></div>
            } @else if (notifications.length === 0) {
              <div class="empty-state">
                <mat-icon class="empty-icon">notifications_none</mat-icon>
                <p class="empty-text">No notifications</p>
              </div>
            } @else {
              @for (notif of notifications.slice(0, 5); track notif.notificationId) {
                <div class="notif-item" [class.unread]="!notif.isRead" (click)="markRead(notif)">
                  <div class="notif-icon" [class]="NOTIFICATION_COLORS[notif.type]">
                    <mat-icon>{{ NOTIFICATION_ICONS[notif.type] }}</mat-icon>
                  </div>
                  <div class="notif-content">
                    <p class="notif-title">{{ notif.title }}</p>
                    <p class="notif-message">{{ notif.message }}</p>
                    <span class="notif-time">{{ notif.createdAt | date:'short' }}</span>
                  </div>
                  @if (!notif.isRead) {
                    <span class="unread-dot"></span>
                  }
                </div>
              }
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { position: relative; }
    .active { color: var(--mat-primary-color, #6366f1); }
    .notification-badge {
      position: absolute; top: -4px; right: -4px;
      min-width: 18px; height: 18px;
      background: #ef4444; color: white;
      font-size: 10px; font-weight: 700;
      border-radius: 9px; display: flex;
      align-items: center; justify-content: center;
      padding: 0 4px; line-height: 1;
    }
    .panel-overlay { position: fixed; inset: 0; z-index: 40; }
    .panel-dropdown {
      position: absolute; top: calc(100% + 8px); right: 0;
      width: 380px; max-height: 480px;
      background: white; border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.12);
      z-index: 50; overflow: hidden;
      display: flex; flex-direction: column;
    }
    .panel-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; border-bottom: 1px solid #f1f5f9;
    }
    .panel-header h3 { font-size: 15px; font-weight: 600; color: #1e293b; margin: 0; }
    .panel-actions { display: flex; gap: 12px; }
    .panel-body { overflow-y: auto; flex: 1; }
    .empty-state { display: flex; flex-direction: column; align-items: center; padding: 32px 20px; }
    .empty-icon { font-size: 40px; width: 40px; height: 40px; color: #cbd5e1; margin-bottom: 8px; }
    .empty-text { font-size: 14px; color: #94a3b8; margin: 0; }
    .notif-item {
      display: flex; gap: 12px; padding: 14px 20px;
      cursor: pointer; transition: background 0.15s;
      position: relative;
    }
    .notif-item:hover { background: #f8fafc; }
    .notif-item.unread { background: #f1f5f9; }
    .notif-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .notif-icon mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .notif-content { flex: 1; min-width: 0; }
    .notif-title { font-size: 13px; font-weight: 600; color: #1e293b; margin: 0 0 2px; }
    .notif-message { font-size: 12px; color: #64748b; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-time { font-size: 11px; color: #94a3b8; margin-top: 4px; display: block; }
    .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #6366f1; flex-shrink: 0; margin-top: 4px; }
  `]
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private elementRef = inject(ElementRef);

  notifications: AppNotification[] = [];
  unreadCount = 0;
  loading = true;
  isOpen = false;

  protected readonly NOTIFICATION_ICONS = NOTIFICATION_ICONS;
  protected readonly NOTIFICATION_COLORS = NOTIFICATION_COLORS;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.notificationService.startPolling();
    this.subs.push(
      this.notificationService.notifications$.subscribe(n => {
        this.notifications = n;
        this.loading = false;
      }),
      this.notificationService.unreadCount$.subscribe(c => this.unreadCount = c)
    );
  }

  ngOnDestroy(): void {
    this.notificationService.stopPolling();
    this.subs.forEach(s => s.unsubscribe());
  }

  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  closePanel(): void {
    this.isOpen = false;
  }

  markRead(notif: AppNotification): void {
    if (!notif.isRead) {
      this.notificationService.markAsRead(notif.notificationId).subscribe();
    }
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe();
  }
}
