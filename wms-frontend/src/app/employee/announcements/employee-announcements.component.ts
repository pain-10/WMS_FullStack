import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AnnouncementService } from '../../services/announcement.service';
import { Announcement } from '../../models';

@Component({
  selector: 'app-employee-announcements',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h1 class="page-title">Announcements</h1>
          <p class="page-subtitle">Company updates visible to employees.</p>
        </div>
        <a routerLink="/dashboard" class="btn-secondary">Back to Dashboard</a>
      </div>

      <div *ngIf="loading" class="text-center py-12 text-surface-400">Loading announcements...</div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div *ngFor="let announcement of announcements" class="card p-6">
          <div class="flex items-start justify-between gap-4">
            <h2 class="text-lg font-semibold text-surface-900">{{ announcement.title }}</h2>
            <span class="text-xs text-surface-400">{{ announcement.createdOn | date:'mediumDate' }}</span>
          </div>
          <p class="mt-3 text-sm text-surface-600">{{ announcement.message }}</p>
        </div>
      </div>

      <div *ngIf="!loading && announcements.length === 0" class="text-center py-12 text-surface-500">
        No announcements available
      </div>
    </div>
  `
})
export class EmployeeAnnouncementsComponent implements OnInit {
  announcements: Announcement[] = [];
  loading = true;
  private announcementService = inject(AnnouncementService);

  ngOnInit(): void {
    this.announcementService.getAll().subscribe({
      next: (data) => {
        this.announcements = data.filter(a => a.isActive);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
