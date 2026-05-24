import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

interface ReportTile {
  title: string;
  description: string;
  route: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-fade-in">
      <div class="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-8 relative overflow-hidden shadow-xl mb-8">
        <div class="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4"></div>
        <div class="relative z-10">
          <span class="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
            Reports
          </span>
          <h1 class="mt-4 text-3xl font-bold text-white">Reports Dashboard</h1>
          <p class="mt-3 max-w-2xl text-primary-100">
            Generate and export workforce, attendance, leave, and project reports.
          </p>
        </div>
      </div>

      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
        @for (tile of tiles; track tile.route) {
          <a [routerLink]="tile.route"
             class="card group border border-surface-200 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary-200 hover:shadow-lg rounded-2xl bg-white">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-start gap-4">
                <div [class]="tile.color + ' w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0'">
                  <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path [attr.d]="tile.icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-surface-900 group-hover:text-primary-700 transition-colors">{{ tile.title }}</h3>
                  <p class="mt-2 text-sm text-surface-500">{{ tile.description }}</p>
                </div>
              </div>
              <svg class="h-5 w-5 text-surface-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        }
      </div>
    </div>
  `,
  styles: [`
    .card { cursor: pointer; }
  `]
})
export class ReportsComponent {
  private authService = inject(AuthService);
  isAdmin = (this.authService.currentUserValue?.roleName ?? '') !== 'Employee';

  tiles: ReportTile[] = [
    ...(this.isAdmin
      ? [{
          title: 'Employee Report',
          description: 'View workforce demographics, department distribution, and role breakdown.',
          route: '/reports/employee',
          icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
          color: 'bg-primary-100 text-primary-600',
        }]
      : []),
    {
      title: 'Attendance Report',
      description: 'Analyze attendance trends, work modes, and present rates.',
      route: '/reports/attendance',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'bg-emerald-100 text-emerald-600',
    },
    {
      title: 'Leave Report',
      description: 'Review leave distribution, approvals, and type breakdowns.',
      route: '/reports/leave',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      color: 'bg-violet-100 text-violet-600',
    },
    ...(this.isAdmin
      ? [{
          title: 'Timesheet Report',
          description: 'Generate and export employee timesheets with PDF/Excel support.',
          route: '/reports/timesheet',
          icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
          color: 'bg-rose-100 text-rose-600',
        }]
      : []),
    {
      title: 'Project Report',
      description: 'Track project statuses, allocations, and completion metrics.',
      route: '/reports/project',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      color: 'bg-amber-100 text-amber-600',
    },
  ];
}
