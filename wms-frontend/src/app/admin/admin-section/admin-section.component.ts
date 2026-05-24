import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-section',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in space-y-6">
      <div class="flex items-end justify-between gap-4">
        <div>
          <h1 class="page-title">{{ title }}</h1>
          <p class="page-subtitle">{{ description }}</p>
        </div>
        <a routerLink="/dashboard" class="btn-secondary">Back to Dashboard</a>
      </div>

      <div class="card p-6">
        <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          @for (item of points; track item) {
            <div class="rounded-2xl bg-surface-50 p-4">
              <p class="text-sm font-medium text-surface-900">{{ item }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class AdminSectionComponent {
  private route = inject(ActivatedRoute);

  get title(): string {
    return this.route.snapshot.data['title'] || 'Admin Section';
  }

  get description(): string {
    return this.route.snapshot.data['description'] || 'Manage this area of the system.';
  }

  get points(): string[] {
    return this.route.snapshot.data['points'] || [];
  }
}