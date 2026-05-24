import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, map, switchMap, tap, catchError, of } from 'rxjs';
import { AppNotification } from '../models/notification.model';
import { AuthService } from '../../services/auth.service';
import { API_BASE_URL } from '../../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private pollingSubscription: any;

  startPolling(): void {
    this.loadNotifications();
    this.pollingSubscription = interval(30000).subscribe(() => this.loadNotifications());
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  getAll(): Observable<AppNotification[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/api/notification`).pipe(
      map(items => items.map(n => this.mapNotification(n)).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )),
      catchError(() => of([]))
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/api/notification/${id}/read`, {}).pipe(
      tap(() => this.loadNotifications()),
      catchError(() => of(void 0))
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${API_BASE_URL}/api/notification/read-all`, {}).pipe(
      tap(() => this.loadNotifications()),
      catchError(() => of(void 0))
    );
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete(`${API_BASE_URL}/api/notification/${id}`, { responseType: 'text' }).pipe(
      map(() => void 0),
      tap(() => this.loadNotifications())
    );
  }

  clearAll(): Observable<void> {
    return this.http.delete(`${API_BASE_URL}/api/notification`, { responseType: 'text' }).pipe(
      map(() => void 0),
      tap(() => this.loadNotifications())
    );
  }

  private loadNotifications(): void {
    this.getAll().subscribe({
      next: (notifications) => {
        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(notifications.filter(n => !n.isRead).length);
      },
    });
  }

  private mapNotification(n: any): AppNotification {
    return {
      notificationId: n.notificationId,
      type: n.type || 'NewAnnouncement',
      title: n.title || '',
      message: n.message || '',
      createdAt: n.createdAt || n.createdOn || '',
      isRead: n.isRead ?? false,
      employeeId: n.employeeId,
      relatedId: n.relatedId,
    };
  }
}
