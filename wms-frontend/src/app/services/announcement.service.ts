import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Announcement } from '../models';
import { API_BASE_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementService {
  private http = inject(HttpClient);

  getAll(): Observable<Announcement[]> {
    return this.http.get<any[]>(`${API_BASE_URL}/api/announcement`).pipe(
      map(items => items.map(a => this.mapAnnouncement(a)))
    );
  }

  getById(id: number): Observable<Announcement> {
    return this.http.get<any>(`${API_BASE_URL}/api/announcement/${id}`).pipe(
      map(a => this.mapAnnouncement(a))
    );
  }

  create(announcement: Partial<Announcement>): Observable<Announcement> {
    return this.http.post<any>(`${API_BASE_URL}/api/announcement`, {
      title: announcement.title,
      message: announcement.message,
      isActive: announcement.isActive ?? true,
    }).pipe(map(a => this.mapAnnouncement(a)));
  }

  update(announcement: Announcement): Observable<Announcement> {
    return this.http.put<any>(`${API_BASE_URL}/api/announcement/${announcement.announcementId}`, {
      title: announcement.title,
      message: announcement.message,
      isActive: announcement.isActive,
    }).pipe(map(a => this.mapAnnouncement(a)));
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete(`${API_BASE_URL}/api/announcement/${id}`, { responseType: 'text' }).pipe(
      map(() => true)
    );
  }

  private mapAnnouncement(a: any): Announcement {
    return {
      announcementId: a.announcementId,
      title: a.title || '',
      message: a.message || '',
      createdBy: a.createdBy || 0,
      createdByName: a.createdByName || '',
      createdOn: a.createdOn ? a.createdOn.split('T')[0] : '',
      updatedOn: a.updatedOn ? a.updatedOn.split('T')[0] : undefined,
      isActive: a.isActive ?? true,
    };
  }
}